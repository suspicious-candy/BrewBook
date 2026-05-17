import { jwtVerify, importSPKI } from "jose";
import dotenv from "dotenv";

dotenv.config();

let _publicKey;
/**
 * Lazily imports and caches the RS256 public key from the PUBLIC_KEY_PEM
 * environment variable. The key is imported once and reused for the lifetime
 * of the process to avoid repeated PEM parsing on every request.
 */
async function getPublicKey() {
  if (!_publicKey) {
    _publicKey = await importSPKI(process.env.PUBLIC_KEY_PEM, "RS256");
  }
  return _publicKey;
}

/**
 * Express middleware that enforces RS256 Bearer token authentication.
 * Extracts the token from the "Authorization: Bearer <token>" header,
 * verifies its signature and issuer claim against the cached RS256 public key,
 * and attaches the decoded JWT payload to req.user on success.
 * Returns 401 if the header is missing or the token is invalid/expired.
 */
export const Authorization = async (req, res, next) => {
  try {
    let token = req.header("Authorization");
    if (!token) return res.status(401).json({ message: "Access Denied" });
    if (token.startsWith("Bearer ")) token = token.slice(7).trimStart();

    const publicKey = await getPublicKey();
    const { payload } = await jwtVerify(token, publicKey, {
      issuer: process.env.ISSUER,
    });
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
