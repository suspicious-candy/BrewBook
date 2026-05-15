import Recipe from "../../models/recipe.js";
import Brewer from "../../models/Brewers.js";
import bean from "../../models/Beans.js";

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
