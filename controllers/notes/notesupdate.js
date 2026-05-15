import Notes from "../../models/notes.js";
import Recipe from "../../models/recipe.js";

export async function updateNotes(req, res) {
  try {
    const { recipeId, ...rest } = req.body;

    if (recipeId !== undefined) {
      const recipeObj = await Recipe.findOne({ ID: recipeId });
      if (!recipeObj) return res.status(404).json({ message: "Recipe not found" });
      rest.Recipe = recipeObj._id;
    }

    const updatedNote = await Notes.findOneAndUpdate({ ID: req.params.id }, rest, { new: true, runValidators: true });
    if (!updatedNote) return res.status(404).json({ message: "Notes not found" });
    res.status(200).json(updatedNote);
  } catch (error) {
    console.error("Error in updateNotes", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
}
