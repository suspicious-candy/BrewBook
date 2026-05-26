import express from "express";
import { Authorization } from "../Middleware/auth.js";
import { ensureUser } from "../Middleware/ensureUser.js";
import { getDashboard } from "../controllers/dashboard/dashboardget.js";

const router = express.Router();

router.get("/", Authorization, ensureUser, getDashboard);

export default router;