import Recipe from "../../models/recipe.js";
import Brewer from "../../models/Brewers.js";
import bean from "../../models/Beans.js";

export async function updateRecipes(req, res) {
  try {
    const { beanId, BrewerID, ...rest } = req.body;

    if (beanId !== undefined) {
      const BeanObj = await bean.findOne({ beanId });
      if (!BeanObj) return res.status(404).json({ message: "bean not found" });
      rest.bean = BeanObj._id;
    }

    if (BrewerID !== undefined) {
      const brewer = await Brewer.findOne({ BrewerID });
      if (!brewer) return res.status(404).json({ message: "Brewer not found" });
      rest.Brewer = brewer._id;
    }

    const updatedRecipe = await Recipe.findOneAndUpdate({ ID: req.params.id }, rest, { new: true, runValidators: true });
    if (!updatedRecipe) return res.status(404).json({ message: "Recipe not found" });
    res.status(200).json(updatedRecipe);
  } catch (error) {
    console.error("Error in updateRecipes", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
}
