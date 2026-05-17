import dotenv from "dotenv"
import { randomBytes, createHash } from "crypto";

dotenv.config();

/**
 * Converts a Buffer (or string) to a base64url-encoded string by replacing
 * the standard base64 characters "+" and "/" with "-" and "_", and stripping
 * trailing "=" padding — as required by RFC 7636 (PKCE).
 */
export function base64url(input){
    return input.toString("base64").replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"");
}

/**
 * Hashes the given string with SHA-256 and returns the result as a base64url
 * string. Used to compute the code_challenge from a code_verifier (S256 PKCE).
 */
export function sha256Base64url(str){
    const hash = createHash("sha256").update(str).digest();
    return base64url(hash);
}

/**
 * Generates a cryptographically random 32-byte token encoded as base64url.
 * Used to create opaque authorization codes and refresh tokens.
 */
export function generateCode(){
    return base64url(randomBytes(32));
}