import Recipe from "../../models/recipe.js";

export async function deleteRecipes(req, res) {
  try {
    const deletedRecipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!deletedRecipe) return res.status(404).json({ message: "Recipe not found" });
    res.status(200).json({ message: "Recipe deleted successfully" });
  } catch (error) {
    console.error("Error in deleteRecipes", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
}
