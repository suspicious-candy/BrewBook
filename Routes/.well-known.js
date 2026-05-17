import express from "express";
import { exportJWK, importSPKI } from "jose";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.get("/jwks.json", async (req, res) => {
    const publicKey = await importSPKI(process.env.PUBLIC_KEY_PEM, "RS256");
    const jwk = await exportJWK(publicKey);
    jwk.use = "sig";
    jwk.alg = "RS256";
    jwk.kid = process.env.KEY_ID;
    res.json({ keys: [jwk] });
});

export default router;
