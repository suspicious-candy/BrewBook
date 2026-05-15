import Notes from "../../models/notes.js";
import Brewer from "../../models/Brewers.js";
import bean from "../../models/Beans.js";
import Recipe from "../../models/recipe.js";

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