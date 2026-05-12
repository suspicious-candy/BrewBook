import express from "express";
import { createRecipes } from "../controllers/Recipes/recipescreate.js";
import { deleteRecipes } from "../controllers/Recipes/recipesdelete.js";
import { getRecipes, getRecipesByID, readRecipeByBrewer, readRecipeByBean, readRecipeByMinRating, readRecipeByGrindSize } from "../controllers/Recipes/recipesgets.js";
import { updateRecipes } from "../controllers/Recipes/recipesupdate.js";

const router = express.Router();

router.get("/", getRecipes);
router.get("/brewer/:Brewer", readRecipeByBrewer);
router.get("/bean/:bean", readRecipeByBean);
router.get("/rating/:min", readRecipeByMinRating);
router.get("/grind/:size", readRecipeByGrindSize);
router.get("/:id", getRecipesByID);
router.post("/", createRecipes);
router.put("/:id", updateRecipes);
router.delete("/:id", deleteRecipes);

export default router;
