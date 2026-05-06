import express from "express";
import { createBrewers } from "../controllers/Brewers/brewerscreate.js";
import { deleteBrewers } from "../controllers/Brewers/brewersdelete.js";
import { readBrewers } from "../controllers/Brewers/brewersread.js";
import { updateBrewers } from "../controllers/Brewers/brewersupdate.js";

const router = express.Router();

router.get("/", readBrewers);
router.post("/", createBrewers);
router.put("/", updateBrewers);
router.delete("/", deleteBrewers);

export default router;
