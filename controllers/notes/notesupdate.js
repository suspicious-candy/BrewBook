import Notes from "../../models/notes.js";
import Recipe from "../../models/recipe.js";

/**
 * PUT /notes/:id
 * Updates a tasting note identified by its numeric ID. If recipeId is supplied
 * in the request body it is resolved to an ObjectId before updating.
 * Returns 404 if the referenced recipe or the note is not found.
 */
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
