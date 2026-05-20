import { redis } from "../config/upstash.js";

const CODE_PREFIX = "oauth:code:";
const REFRESH_PREFIX = "oauth:rt:";
const CODE_TTL = 300;          // 5 minutes — matches the expiresAt window
const REFRESH_TTL = 2592000;   // 30 days

export async function setAuthCode(code, data) {
    await redis.set(CODE_PREFIX + code, data, { ex: CODE_TTL });
}

export async function getAuthCode(code) {
    return redis.get(CODE_PREFIX + code);
}

export async function deleteAuthCode(code) {
    await redis.del(CODE_PREFIX + code);
}

export async function setRefreshToken(token, data) {
    await redis.set(REFRESH_PREFIX + token, data, { ex: REFRESH_TTL });
}

export async function getRefreshToken(token) {
    return redis.get(REFRESH_PREFIX + token);
}

export async function deleteRefreshToken(token) {
    await redis.del(REFRESH_PREFIX + token);
}
