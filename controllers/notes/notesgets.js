import Notes from "../../models/notes.js";
import Brewer from "../../models/Brewers.js";
import bean from "../../models/Beans.js";
import Recipe from "../../models/recipe.js";

// Populate Recipe → { bean, Brewer } so list screens can read note.Recipe.bean.Name
// and note.Recipe.Brewer.Name without doing a follow-up fetch.
const RECIPE_POPULATE = {
  path: "Recipe",
  populate: [{ path: "bean" }, { path: "Brewer" }],
};

/**
 * GET /notes
 * Returns all Notes (tasting note) documents in the collection.
 */
export async function getNotes(req, res) {
  try {
    const notes = await Notes.find().populate(RECIPE_POPULATE).sort({ Date: -1 });
    res.status(200).json(notes);
  } catch (error) {
    console.error("Error in the getNotes", error);
    res.status(500).json({ message: error.message ?? "Internal Server Issue" });
  }
};

/**
 * GET /notes/:id
 * Returns the tasting note whose numeric ID matches req.params.id.
 * Returns 404 if no note is found.
 */
export async function readNotesByID(req, res) {
  try {
    const notes = await Notes.findOne({ ID: req.params.id }).populate(RECIPE_POPULATE);
    if (!notes) return res.status(404).json({ message: "Notes not found" });
    res.status(200).json(notes);
  } catch (error) {
    console.error("Error in the readNotesByID", error);
    res.status(500).json({ message: error.message ?? "Internal Server Issue" });
  }
};

/**
 * GET /notes/brewer/:id
 * Returns all tasting notes that belong to recipes linked to the brewer
 * whose numeric BrewerID matches req.params.id. First resolves the brewer,
 * then fetches matching recipe ObjectIds, then queries notes.
 * Returns 404 if the brewer is not found.
 */
export async function readNotesByBrewer(req, res) {
  try {
    const brewer = await Brewer.findOne({ BrewerID: req.params.id });
    if (!brewer) return res.status(404).json({ message: "Brewer not found" });
    const recipes = await Recipe.find({ Brewer: brewer._id }, "_id");
    const recipeIds = recipes.map((r) => r._id);
    const notes = await Notes.find({ Recipe: { $in: recipeIds } })
      .populate(RECIPE_POPULATE)
      .sort({ Date: -1 });
    res.status(200).json(notes);
  } catch (error) {
    console.error("Error in readNotesByBrewer", error);
    res.status(500).json({ message: error.message ?? "Internal Server Issue" });
  }
};

/**
 * GET /notes/bean/:id
 * Returns all tasting notes that belong to recipes linked to the bean whose
 * numeric beanId matches req.params.id. First resolves the bean, then fetches
 * matching recipe ObjectIds, then queries notes. Returns 404 if the bean is not found.
 */
export async function readNotesByBean(req, res) {
  try {
    const BeanObj = await bean.findOne({ beanId: req.params.id });
    if (!BeanObj) return res.status(404).json({ message: "bean not found" });
    const recipes = await Recipe.find({ bean: BeanObj._id }, "_id");
    const recipeIds = recipes.map((r) => r._id);
    const notes = await Notes.find({ Recipe: { $in: recipeIds } })
      .populate(RECIPE_POPULATE)
      .sort({ Date: -1 });
    res.status(200).json(notes);
  } catch (error) {
    console.error("Error in readNotesByBean", error);
    res.status(500).json({ message: error.message ?? "Internal Server Issue" });
  }
};

/**
 * GET /notes/recipe/:id
 * Returns all tasting notes linked to the recipe whose numeric ID matches
 * req.params.id. Returns 404 if the recipe is not found.
 */
export async function readNotesByRecipe(req, res) {
  try {
    const recipeObj = await Recipe.findOne({ ID: req.params.id });
    if (!recipeObj) return res.status(404).json({ message: "Recipe not found" });
    const notes = await Notes.find({ Recipe: recipeObj._id })
      .populate(RECIPE_POPULATE)
      .sort({ Date: -1 });
    res.status(200).json(notes);
  } catch (error) {
    console.error("Error in readNotesByRecipe", error);
    res.status(500).json({ message: error.message ?? "Internal Server Issue" });
  }
};

/**
 * GET /notes/rating/:min
 * Returns all tasting notes whose overallRating is greater than or equal to the
 * numeric value in req.params.min. Returns 400 if the value is not a valid number.
 */
export async function readNotesByMinRating(req, res) {
  try {
    const min = Number(req.params.min);
    if (isNaN(min)) return res.status(400).json({ message: "Invalid rating value" });
    const notes = await Notes.find({ overallRating: { $gte: min } })
      .populate(RECIPE_POPULATE)
      .sort({ Date: -1 });
    res.status(200).json(notes);
  } catch (error) {
    console.error("Error in readNotesByMinRating", error);
    res.status(500).json({ message: error.message ?? "Internal Server Issue" });
  }
};
