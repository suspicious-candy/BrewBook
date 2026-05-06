import express from "express";
import { createBeans } from "../controllers/Beans/BeansCreate.js";
import { deleteBeans } from "../controllers/Beans/BeansDelete.js";
import { readBeans } from "../controllers/Beans/BeansRead.js";
import { updateBeans } from "../controllers/Beans/BeansUpdate.js";

const router = express.Router();

router.get("/", readBeans);
router.post("/", createBeans);
router.put("/", updateBeans);
router.delete("/", deleteBeans);

export default router;
