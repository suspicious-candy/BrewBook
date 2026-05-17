import express from "express";
import { clients } from "../oauth/clients.js";
import { authorizationCodes, refreshTokens } from "../oauth/store.js";
import { generateCode, sha256Base64url } from "../config/oauth.js";
import { SignJWT, importPKCS8 } from "jose";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.post("/", async (req, res) => {
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
        const accessToken = await new SignJWT({ scope: record.scope, ...record.user })
            .setProtectedHeader({ alg: "RS256", kid: process.env.KEY_ID })
            .setIssuer(process.env.ISSUER)
            .setAudience(client_id)
            .setSubject(record.user.id)
            .setIssuedAt()
            .setExpirationTime("15m")
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
            scope: record.scope,
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

export default router;
