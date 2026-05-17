import Notes from "../../models/notes.js";
import Recipe from "../../models/recipe.js";

/**
 * POST /notes
 * Creates a new Notes (tasting note) document. If recipeId is provided in the
 * request body, it is resolved to a MongoDB ObjectId before saving.
 * Returns 404 if the referenced recipe does not exist, or 500 on a database error.
 */
export async function createNotes(req, res) {
  try {
    const { recipeId, ...rest } = req.body;
    let recipeObjectId;
    if (recipeId !== undefined) {
      const recipeObj = await Recipe.findOne({ ID: recipeId });
      if (!recipeObj) return res.status(404).json({ message: "Recipe not found" });
      recipeObjectId = recipeObj._id;
    }

    const newNote = new Notes({ ...rest, Recipe: recipeObjectId });
    const savedNote = await newNote.save();
    res.status(201).json(savedNote);
  } catch (error) {
    console.error("Error in createNotes", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
}