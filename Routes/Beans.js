import express from "express";
import { createBeans } from "../controllers/Beans/BeansCreate.js";
import { deleteBeans } from "../controllers/Beans/BeansDelete.js";
import { readBeans, readBeanByID, readBeanByRoast, readBeanByVarietal, readBeanByOriginCountry } from "../controllers/Beans/BeansRead.js";
import { updateBeans, updateBeanLastBrew } from "../controllers/Beans/BeansUpdate.js";

const router = express.Router();

router.get("/", readBeans);
router.get("/roast/:roast", readBeanByRoast);
router.get("/varietal/:varietal", readBeanByVarietal);
router.get("/origin/:country", readBeanByOriginCountry);
router.get("/:id", readBeanByID);
router.post("/", createBeans);
router.put("/:id", updateBeans);
router.patch("/:id/lastBrew", updateBeanLastBrew);
router.delete("/:id", deleteBeans);

export default router;
