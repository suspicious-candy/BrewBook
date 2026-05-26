import express from "express";
import { Authorization } from "../Middleware/auth.js";
import { createBrewers } from "../controllers/Brewers/brewerscreate.js";
import { deleteBrewers } from "../controllers/Brewers/brewersdelete.js";
import { readBrewers, readBrewerByID, readBrewerByType,readBrewerByFilterType } from "../controllers/Brewers/brewersread.js";
import { updateBrewers } from "../controllers/Brewers/brewersupdate.js";
import {
  readUserBrewers,
  addBrewerToUser,
  removeBrewerFromUser,
} from "../controllers/Brewers/brewerscollection.js";

const router = express.Router();

// Per-user collection — must be declared BEFORE the generic /:id routes so
// Express matches "/me" instead of treating "me" as a :id value.
router.get("/me", Authorization, readUserBrewers);
router.post("/me/:brewerId", Authorization, addBrewerToUser);
router.delete("/me/:brewerId", Authorization, removeBrewerFromUser);

router.get("/", readBrewers);
router.get("/filter/:filterType", readBrewerByFilterType);
router.get("/type/:Type", readBrewerByType);
router.get("/:id", readBrewerByID);
router.post("/", createBrewers);
router.put("/:id", updateBrewers);
router.delete("/:id", deleteBrewers);

export default router;
