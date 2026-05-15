import Notes from "../../models/notes.js";
import Brewer from "../../models/Brewers.js";
import bean from "../../models/Beans.js";
import Recipe from "../../models/recipe.js";

export async function getNotes(req, res) {
  try {
    const notes = await Notes.find();
    res.status(200).json(notes);
  } catch (error) {
    console.error("Error in the getNotes", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
};

export async function readNotesByID(req, res) {
  try {
    const notes = await Notes.findOne({ ID: req.params.id });
    if (!notes) return res.status(404).json({ message: "Notes not found" });
    res.status(200).json(notes);
  } catch (error) {
    console.error("Error in the readNotesByID", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
};

export async function readNotesByBrewer(req, res) {
  try {
    const brewer = await Brewer.findOne({ BrewerID: req.params.id });
    if (!brewer) return res.status(404).json({ message: "Brewer not found" });
    const recipes = await Recipe.find({ Brewer: brewer._id }, "_id");
    const recipeIds = recipes.map((r) => r._id);
    const notes = await Notes.find({ Recipe: { $in: recipeIds } });
    res.status(200).json(notes);
  } catch (error) {
    console.error("Error in readNotesByBrewer", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
};

export async function readNotesByBean(req, res) {
  try {
    const BeanObj = await bean.findOne({ beanId: req.params.id });
    if (!BeanObj) return res.status(404).json({ message: "bean not found" });
    const recipes = await Recipe.find({ bean: BeanObj._id }, "_id");
    const recipeIds = recipes.map((r) => r._id);
    const notes = await Notes.find({ Recipe: { $in: recipeIds } });
    res.status(200).json(notes);
  } catch (error) {
    console.error("Error in readNotesByBean", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
};

export async function readNotesByRecipe(req, res) {
  try {
    const recipeObj = await Recipe.findOne({ ID: req.params.id });
    if (!recipeObj) return res.status(404).json({ message: "Recipe not found" });
    const notes = await Notes.find({ Recipe: recipeObj._id });
    res.status(200).json(notes);
  } catch (error) {
    console.error("Error in readNotesByRecipe", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
};

export async function readNotesByMinRating(req, res) {
  try {
    const min = Number(req.params.min);
    if (isNaN(min)) return res.status(400).json({ message: "Invalid rating value" });
    const notes = await Notes.find({ overallRating: { $gte: min } });
    res.status(200).json(notes);
  } catch (error) {
    console.error("Error in readNotesByMinRating", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
};
