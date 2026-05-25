import express from "express";
import bcrypt from "bcrypt";
import { clients } from "../oauth/clients.js";
import { setAuthCode, getAuthCode, deleteAuthCode, setRefreshToken, getRefreshToken, deleteRefreshToken } from "../oauth/store.js";
import { generateCode, sha256Base64url } from "../config/oauth.js";
import { SignJWT, exportJWK, importPKCS8, importSPKI } from "jose";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

function loginForm(params, error = "") {
  const {
    response_type = "",
    client_id = "",
    redirect_uri = "",
    scope = "",
    state = "",
    code_challenge = "",
    code_challenge_method = "",
  } = params;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>BrewBook Login</title>
  <style>
    body { font-family: sans-serif; max-width: 380px; margin: 80px auto; color: #222; }
    h2 { margin-bottom: 20px; }
    label { display: block; margin-bottom: 14px; font-size: 14px; }
    input[type="email"], input[type="password"] {
      display: block; width: 100%; margin-top: 4px; padding: 8px;
      box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px;
    }
    button { padding: 10px 24px; background: #4a3728; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
    .error { color: #c0392b; font-size: 14px; margin-bottom: 14px; }
  </style>
</head>
<body>
  <h2>Sign in to BrewBook</h2>
  ${error ? `<p class="error">${error}</p>` : ""}
  <form method="POST" action="/oauth/authorize">
    <input type="hidden" name="response_type"        value="${response_type}" />
    <input type="hidden" name="client_id"            value="${client_id}" />
    <input type="hidden" name="redirect_uri"         value="${redirect_uri}" />
    <input type="hidden" name="scope"                value="${scope}" />
    <input type="hidden" name="state"                value="${state}" />
    <input type="hidden" name="code_challenge"       value="${code_challenge}" />
    <input type="hidden" name="code_challenge_method" value="${code_challenge_method}" />
    <label>Email
      <input type="email" name="email" required autocomplete="email" />
    </label>
    <label>Password
      <input type="password" name="password" required autocomplete="current-password" />
    </label>
    <button type="submit">Sign In</button>
  </form>
</body>
</html>`;
}

function validateOAuthParams({ response_type, client_id, redirect_uri, code_challenge, code_challenge_method }) {
  const client = clients.get(client_id);
  if (!client) return "Unknown client ID";
  if (!client.redirectUris.includes(redirect_uri)) return "Invalid redirect URI";
  if (response_type !== "code") return "response_type must be 'code'";
  if (!code_challenge || code_challenge_method !== "S256") return "PKCE required: code_challenge_method must be S256";
  return null;
}

/**
 * GET /oauth/authorize
 * Validates OAuth/PKCE params then serves the login form.
 */
router.get("/authorize", (req, res) => {
  const params = req.query;
  const err = validateOAuthParams(params);
  if (err) return res.status(400).send(err);
  res.send(loginForm(params));
});

/**
 * POST /oauth/authorize
 * Receives login form submission. Validates credentials against the database,
 * then issues an auth code and redirects back to the client.
 */
router.post("/authorize", async (req, res) => {
  const { email, password, ...oauthParams } = req.body;

  const err = validateOAuthParams(oauthParams);
  if (err) return res.status(400).send(err);

  const { client_id, redirect_uri, scope = "", state, code_challenge } = oauthParams;

  const foundUser = await User.findOne({ email });
  if (!foundUser) {
    return res.send(loginForm(oauthParams, "Invalid email or password"));
  }

  const passwordMatch = await bcrypt.compare(password, foundUser.password);
  if (!passwordMatch) {
    return res.send(loginForm(oauthParams, "Invalid email or password"));
  }

  const code = generateCode();
  await setAuthCode(code, {
    client_id,
    redirect_uri,
    codeChallenge: code_challenge,
    scope,
    user: { id: foundUser._id.toString(), email: foundUser.email },
    expiresAt: Date.now() + 5 * 60 * 1000,
  });
  console.log("[AUTH] code stored:", code);

  const redirectUrl = new URL(redirect_uri);
  redirectUrl.searchParams.set("code", code);
  if (state) redirectUrl.searchParams.set("state", state);
  res.redirect(redirectUrl.toString());
});

/**
 * POST /oauth/token
 * Handles authorization_code and refresh_token grant types.
 */
router.post("/token", async (req, res) => {
  const { grant_type } = req.body;

  if (grant_type === "authorization_code") {
    const { code, redirect_uri, client_id, code_verifier } = req.body;

    console.log("[TOKEN] code received:", code);
    const record = await getAuthCode(code);
    console.log("[TOKEN] record found:", record);
    if (!record) {
      return res.status(400).json({ error: "invalid_grant", error_description: "Unknown authorization code" });
    }
    if (record.expiresAt < Date.now()) {
      await deleteAuthCode(code);
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

    await deleteAuthCode(code);

    const privateKey = await importPKCS8(process.env.PRIVATE_KEY_PEM, "RS256");
    const accessToken = await new SignJWT({ scope: record.scope, client_id, ...record.user })
      .setProtectedHeader({ alg: "RS256", kid: process.env.KEY_ID })
      .setIssuer(process.env.ISSUER)
      .setAudience(process.env.RESOURCE_SERVER_AUDIENCE)
      .setIssuedAt()
      .setExpirationTime("15m")
      .setSubject(record.user.id)
      .sign(privateKey);

    const refresh_token = generateCode();
    await setRefreshToken(refresh_token, {
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
    const record = await getRefreshToken(refresh_token);
    if (!record) return res.status(400).json({ error: "invalid_grant", error_description: "Refresh token not found" });
    if (record.client_id !== client_id) return res.status(400).json({ error: "invalid_grant", error_description: "Client mismatch" });

    const privateKey = await importPKCS8(process.env.PRIVATE_KEY_PEM, "RS256");
    const accessToken = await new SignJWT({ scope: record.scope })
      .setProtectedHeader({ alg: "RS256", kid: process.env.KEY_ID })
      .setIssuer(process.env.ISSUER)
      .setAudience(process.env.RESOURCE_SERVER_AUDIENCE)
      .setSubject(record.sub)
      .setIssuedAt()
      .setExpirationTime("15m")
      .sign(privateKey);

    const new_refresh_token = generateCode();
    await deleteRefreshToken(refresh_token);
    await setRefreshToken(new_refresh_token, {
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
 * Exports the RS256 public key as a JWKS document.
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
