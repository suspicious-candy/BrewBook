import express from "express";
import { Authorization } from "../Middleware/auth.js";
import { createBeans } from "../controllers/Beans/BeansCreate.js";
import { deleteBeans } from "../controllers/Beans/BeansDelete.js";
import { readBeans, readBeanByID, readBeanByRoast, readBeanByVarietal, readBeanByOriginCountry,readBeanByEmail } from "../controllers/Beans/BeansRead.js";
import { updateBeans, updateBeanLastBrew, consumeBean } from "../controllers/Beans/BeansUpdate.js";

const router = express.Router();

router.get("/", readBeans);
router.get("/roast/:roast", readBeanByRoast);
router.get("/varietal/:varietal", readBeanByVarietal);
router.get("/origin/:country", readBeanByOriginCountry);
router.get("/user/:email", readBeanByEmail);
router.get("/:id", readBeanByID);
router.post("/", Authorization, createBeans);
router.put("/:id", Authorization, updateBeans);
router.patch("/:id/lastBrew", Authorization, updateBeanLastBrew);
router.patch("/:id/consume", Authorization, consumeBean);
router.delete("/:id", Authorization, deleteBeans);

export default router;
