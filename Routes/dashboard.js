import express from "express";
import { Authorization } from "../Middleware/auth.js";
import { getDashboard } from "../controllers/dashboard/dashboardget.js";

const router = express.Router();

 router.get("/", Authorization, getDashboard);

export default router;