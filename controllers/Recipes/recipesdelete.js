import Recipe from "../../models/recipe.js";

/**
 * DELETE /recipes/:id
 * Finds a recipe by its numeric ID and removes it from the database.
 * Returns 404 if no recipe matches, 200 with a success message on deletion.
 */
export async function deleteRecipes(req, res) {
  try {
    const deletedRecipe = await Recipe.findOneAndDelete({ID:req.params.id});
    if (!deletedRecipe) return res.status(404).json({ message: "Recipe not found" });
    res.status(200).json({ message: "Recipe deleted successfully" });
  } catch (error) {
    console.error("Error in deleteRecipes", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
}
