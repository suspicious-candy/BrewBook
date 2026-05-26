import { jwtVerify, createRemoteJWKSet } from "jose";
import dotenv from "dotenv";

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
if (!SUPABASE_URL) {
  throw new Error("Missing SUPABASE_URL in environment");
}

const issuer = `${SUPABASE_URL}/auth/v1`;
const audience = "authenticated";

// Verify with HS256 shared secret if provided (legacy projects); otherwise
// fetch the project's JWKS for asymmetric verification (modern default).
const hs256Key = process.env.SUPABASE_JWT_SECRET
  ? new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET)
  : null;

const jwks = hs256Key
  ? null
  : createRemoteJWKSet(new URL(`${SUPABASE_URL}/auth/v1/.well-known/jwks.json`));

export const Authorization = async (req, res, next) => {
  try {
    let token = req.header("Authorization");
    if (!token) return res.status(401).json({ message: "Access Denied" });
    if (token.startsWith("Bearer ")) token = token.slice(7).trimStart();

    const { payload } = await jwtVerify(token, hs256Key ?? jwks, {
      issuer,
      audience,
    });
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
