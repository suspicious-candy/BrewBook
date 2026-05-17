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
    const { BrewerID, beanId, ...rest } = req.body;
    let brewerObjectId;
    if (BrewerID !== undefined) {
      const brewer = await Brewer.findOne({ BrewerID });
      if (!brewer) return res.status(404).json({ message: "Brewer not found" });
      brewerObjectId = brewer._id;
    }
    
    let beanObjectId;
    if (beanId !== undefined) {
      const BeanObj = await bean.findOne({ beanId });
      if (!BeanObj) return res.status(404).json({ message: "bean not found" });
      beanObjectId = BeanObj._id;
    }
    const newRecipe = new Recipe({ ...rest, bean:beanObjectId ,Brewer: brewerObjectId });
    const savedRecipe = await newRecipe.save();
    res.status(201).json(savedRecipe);
  } catch (error) {
    console.error("Error in createRecipes", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
}
