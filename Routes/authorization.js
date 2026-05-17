import express from "express";
import { clients } from "../oauth/clients.js";
import { authorizationCodes } from "../oauth/store.js";
import { generateCode, sha256Base64url } from "../config/oauth.js";
import { SignJWT, exportJWK, importPKCS8, importSPKI } from "jose";
import { refreshTokens } from "../oauth/store.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

/**
 * Returns a hardcoded demo user object for development/testing purposes.
 * In a production system this would perform real user authentication (e.g.,
 * validate credentials, look up the user in the database) before issuing tokens.
 */
function getDemoUser() {
    return { id: "demo-user", email: "demo@example.com" };
}

/**
 * GET /oauth/authorize
 * Initiates the Authorization Code + PKCE flow. Validates the client_id,
 * redirect_uri, response_type, and PKCE code_challenge (S256 only). On success,
 * generates a short-lived (5-minute) authorization code, stores it in memory
 * alongside the PKCE challenge and user info, then redirects the client back to
 * redirect_uri with ?code=<code>[&state=<state>].
 */
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

/**
 * POST /oauth/token
 * Handles two grant types:
 *
 * authorization_code — Validates the code, client_id, redirect_uri, and PKCE
 *   code_verifier. On success, issues an RS256 access token (15 min) and a
 *   single-use refresh token, then deletes the authorization code from the store.
 *
 * refresh_token — Validates the refresh token and client_id, issues a new RS256
 *   access token (15 min), rotates the refresh token (old one is deleted), and
 *   returns the new pair. Any other grant_type returns 400 unsupported_grant_type.
 */
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
            .setProtectedHeader({ alg: "RS256", kid: process.env.KEY_ID })
            .setIssuer(process.env.ISSUER)
            .setAudience(client_id)
            .setIssuedAt()
            .setExpirationTime("15m")
            .setSubject(record.user.id)
            .sign(privateKey);

        const refresh_token = generateCode();
        refreshTokens.set(refresh_token, {
            sub: record.user.id,
            scope: record.scope,
            client_id,
        });

        return res.json({
            access_token: accessToken,
            token_type: "Bearer",
            expires_in: 900,
            refresh_token,
            scope: record.scope
        });
    }

    if (grant_type === "refresh_token") {
        const { refresh_token, client_id } = req.body;
        const record = refreshTokens.get(refresh_token);
        if (!record) return res.status(400).json({ error: "invalid_grant", error_description: "Refresh token not found" });
        if (record.client_id !== client_id) return res.status(400).json({ error: "invalid_grant", error_description: "Client mismatch" });

        const privateKey = await importPKCS8(process.env.PRIVATE_KEY_PEM, "RS256");
        const accessToken = await new SignJWT({ scope: record.scope })
            .setProtectedHeader({ alg: "RS256", kid: process.env.KEY_ID })
            .setIssuer(process.env.ISSUER)
            .setAudience(client_id)
            .setSubject(record.sub)
            .setIssuedAt()
            .setExpirationTime("15m")
            .sign(privateKey);

        const new_refresh_token = generateCode();
        refreshTokens.delete(refresh_token);
        refreshTokens.set(new_refresh_token, {
            sub: record.sub,
            scope: record.scope,
            client_id: record.client_id,
        });

        return res.json({
            access_token: accessToken,
            token_type: "Bearer",
            expires_in: 900,
            refresh_token: new_refresh_token,
            scope: record.scope,
        });
    }

    return res.status(400).json({ error: "unsupported_grant_type", error_description: "Grant type not supported" });
});

/**
 * GET /.well-known/jwks.json
 * Exports the RS256 public key as a JWKS document so that resource servers and
 * clients can verify access tokens without possessing the private key.
 * The JWK is annotated with "use": "sig", "alg": "RS256", and the KEY_ID from env.
 */
export async function jwksHandler(req, res) {
    const publicKey = await importSPKI(process.env.PUBLIC_KEY_PEM, "RS256");
    const jwk = await exportJWK(publicKey);
    jwk.use = "sig";
    jwk.alg = "RS256";
    jwk.kid = process.env.KEY_ID;
    res.json({ keys: [jwk] });
}

export default router;
