import Recipe from "../../models/recipe.js";
import Brewer from "../../models/Brewers.js";
import bean from "../../models/Beans.js";

/**
 * POST /recipes
 * Creates a new Recipe document. If BrewerID or beanId are provided in the
 * request body, they are resolved to MongoDB ObjectIds before saving.
 * Returns 404 if either referenced document does not exist,
 * or 500 on a database error.
 */
export async function createRecipes(req, res) {
  try {
    const { BrewerID, beanId, Brewer: incomingBrewerRef, bean: incomingBeanRef, ...rest } = req.body;

    // Resolve brewer: accept either numeric BrewerID or a direct ObjectId.
    let brewerObjectId = incomingBrewerRef;
    if (BrewerID !== undefined) {
      const brewer = await Brewer.findOne({ BrewerID });
      if (!brewer) return res.status(404).json({ message: "Brewer not found" });
      brewerObjectId = brewer._id;
    }

    // Resolve bean: accept either numeric beanId or a direct ObjectId.
    let beanObjectId = incomingBeanRef;
    if (beanId !== undefined) {
      const BeanObj = await bean.findOne({ beanId });
      if (!BeanObj) return res.status(404).json({ message: "bean not found" });
      beanObjectId = BeanObj._id;
    }

    // The schema requires a unique numeric ID; auto-assign the next one if
    // the client didn't provide it.
    let nextId = rest.ID;
    if (nextId === undefined) {
      const last = await Recipe.findOne().sort({ ID: -1 }).select("ID");
      nextId = last ? last.ID + 1 : 1;
    }

    const newRecipe = new Recipe({
      ...rest,
      ID: nextId,
      bean: beanObjectId,
      Brewer: brewerObjectId,
    });
    const savedRecipe = await newRecipe.save();
    res.status(201).json(savedRecipe);
  } catch (error) {
    console.error("Error in createRecipes", error);
    res.status(500).json({ message: error.message ?? "Internal Server Issue" });
  }
}
