import express from "express";
import { clients } from "../oauth/clients.js";
import { authorizationCodes } from "../oauth/store.js";
import { generateCode, sha256Base64url } from "../config/oauth.js";
import { SignJWT, exportJWK, importPKCS8, importSPKI } from "jose";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

function getDemoUser() {
    return { id: "demo-user", email: "demo@example.com" };
}

router.get("/authorize", (req, res) => {
    const { response_type, client_id, redirect_uri, scope = "", state, code_challenge, code_challenge_method } = req.query;

    const client = clients.get(client_id);
    if (!client) {
        return res.status(400).send("Unknown client ID");
    }
    if (!client.redirectUris.includes(redirect_uri)) {
        return res.status(400).send("invalid redirectUri");
    }
    if (response_type !== "code") {
        return res.status(400).send("invalid response type");
    }
    if (!code_challenge || code_challenge_method !== "S256") {
        return res.status(400).send("PKCE required: provided code challenge invalid");
    }

    const user = getDemoUser();
    const code = generateCode();
    authorizationCodes.set(code, {
        client_id,
        redirect_uri,
        codeChallenge: code_challenge,
        scope,
        user,
        expiresAt: Date.now() + 5 * 60 * 1000
    });

    const redirect = new URL(redirect_uri);
    redirect.searchParams.set("code", code);
    if (state) {
        redirect.searchParams.set("state", state);
    }
    res.redirect(redirect.toString());
});

router.post("/token", async (req, res) => {
    const { grant_type } = req.body;

    if (grant_type === "authorization_code") {
        const { code, redirect_uri, client_id, code_verifier } = req.body;

        const record = authorizationCodes.get(code);
        if (!record) {
            return res.status(400).json({ error: "invalid_grant", error_description: "There is no record of this code" });
        }
        if (record.expiresAt < Date.now()) {
            authorizationCodes.delete(code);
            return res.status(400).json({ error: "invalid_grant", error_description: "Code expired" });
        }
        if (record.client_id !== client_id) {
            return res.status(400).json({ error: "invalid_grant", error_description: "Client mismatch" });
        }
        if (record.redirect_uri !== redirect_uri) {
            return res.status(400).json({ error: "invalid_grant", error_description: "Redirect URI mismatch" });
        }

        const computedChallenge = sha256Base64url(code_verifier);
        if (computedChallenge !== record.codeChallenge) {
            return res.status(400).json({ error: "invalid_grant", error_description: "PKCE validation failed" });
        }

        authorizationCodes.delete(code);

        const privateKey = await importPKCS8(process.env.PRIVATE_KEY_PEM, "RS256");
        const accessToken = await new SignJWT({ scope: record.scope, client_id, ...record.user })
            .setProtectedHeader({ alg: "RS256" })
            .setIssuedAt()
            .setExpirationTime("1h")
            .setSubject(record.user.id)
            .sign(privateKey);

        return res.json({
            access_token: accessToken,
            token_type: "Bearer",
            expires_in: 3600,
            scope: record.scope
        });
    }

    return res.status(400).json({ error: "unsupported_grant_type", error_description: "Grant type not supported" });
});

export async function jwksHandler(req, res) {
    const publicKey = await importSPKI(process.env.PUBLIC_KEY_PEM, "RS256");
    const jwk = await exportJWK(publicKey);
    jwk.use = "sig";
    jwk.alg = "RS256";
    jwk.kid = process.env.KEY_ID;
    res.json({ keys: [jwk] });
}

export default router;
