import express from "express";
import { createRecipes } from "../controllers/Recipes/recipescreate.js";
import { deleteRecipes } from "../controllers/Recipes/recipesdelete.js";
import { getRecipes } from "../controllers/Recipes/recipesgets.js";
import { updateRecipes } from "../controllers/Recipes/recipesupdate.js";

const router = express.Router();

router.get("/", getRecipes);
router.post("/", createRecipes);
router.put("/", updateRecipes);
router.delete("/", deleteRecipes);

export default router;
