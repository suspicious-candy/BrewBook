import express from "express";
import { createBrewers } from "../controllers/Brewers/brewerscreate.js";
import { deleteBrewers } from "../controllers/Brewers/brewersdelete.js";
import { readBrewers, readBrewerByID, readBrewerByType } from "../controllers/Brewers/brewersread.js";
import { updateBrewers } from "../controllers/Brewers/brewersupdate.js";

const router = express.Router();

router.get("/", readBrewers);
router.get("/filter/:filterType", readBrewerByType);
router.get("/:id", readBrewerByID);
router.post("/", createBrewers);
router.put("/:id", updateBrewers);
router.delete("/:id", deleteBrewers);

export default router;
