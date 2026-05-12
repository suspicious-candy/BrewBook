import Recipe from "../../models/recipe.js";

export async function createRecipes(req, res) {
  try {
    const newRecipe = new Recipe(req.body);
    const savedRecipe = await newRecipe.save();
    res.status(201).json(savedRecipe);
  } catch (error) {
    console.error("Error in createRecipes", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
}
