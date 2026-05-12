import Recipe from "../../models/recipe.js";

export async function updateRecipes(req, res) {
  try {
    const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedRecipe) return res.status(404).json({ message: "Recipe not found" });
    res.status(200).json(updatedRecipe);
  } catch (error) {
    console.error("Error in updateRecipes", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
}
