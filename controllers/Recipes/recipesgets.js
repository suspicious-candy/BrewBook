import Recipe from "../../models/recipe.js";
import Brewer from "../../models/Brewers.js";
import bean from "../../models/Beans.js";

/**
 * GET /recipes
 * Returns all Recipe documents in the collection.
 */
export async function getRecipes (req, res) {
  try{
    const Recipes = await Recipe.find();
    res.status(200).json(Recipes) 
  }
  catch(error){
    console.error("Error in the getRecipes",error);
    res.status(500).json({message:"Internal Server Issue"})
  }
};

/**
 * GET /recipes/:id
 * Returns the recipe whose numeric ID matches req.params.id.
 * Returns 404 if no recipe is found.
 */
export async function getRecipesByID (req, res) {
  try{
    const Recipes = await Recipe.findOne({ID:req.params.id});
    if (!Recipes) return res.status(404).json({ message: "Recipe not found" });
    res.status(200).json(Recipes);
  }
  catch(error){
    console.error("Error in the  getRecipesByID ",error);
    res.status(500).json({message:"Internal Server Issue"})
  }
};

/**
 * GET /recipes/brewer/:id
 * Returns all recipes associated with the brewer whose numeric BrewerID matches
 * req.params.id. Resolves the BrewerID to an ObjectId before querying. Returns 404
 * if the brewer is not found.
 */
export async function readRecipeByBrewer(req, res) {
  try{
    let brewerObjectId;
    if (req.params.id !== undefined) {
      const brewer = await Brewer.findOne({ BrewerID : req.params.id });

      if (!brewer) return res.status(404).json({ message: "Brewer not found" });
      brewerObjectId = brewer._id;
    }
    const Recipes = await Recipe.find({ Brewer: brewerObjectId });
    res.status(200).json(Recipes) 
  }
  catch(error){
    console.error("Error in the readRecipeByBrewer",error);
    res.status(500).json({message:"Internal Server Issue"})
  }
};

/**
 * GET /recipes/bean/:id
 * Returns all recipes associated with the bean whose numeric beanId matches
 * req.params.id. Resolves the beanId to an ObjectId before querying. Returns 404
 * if the bean is not found.
 */
export async function readRecipeByBean(req, res) {
  try{
    let beanObjectId;
    if (req.params.id !== undefined) {
      const BeanObj = await bean.findOne({ beanId : req.params.id });
      if (!BeanObj) return res.status(404).json({ message: "bean not found" });
      beanObjectId = BeanObj._id;
    }
    const Recipes = await Recipe.find({ bean:beanObjectId });
    res.status(200).json(Recipes)
  }
  catch(error){
    console.error("Error in the readRecipeByBean",error);
    res.status(500).json({message:"Internal Server Issue"})
  }
};

/**
 * GET /recipes/rating/:min
 * Returns all recipes whose overallRating is greater than or equal to the
 * numeric value in req.params.min. Returns 400 if the value is not a valid number.
 */
export async function readRecipeByMinRating(req, res) {
  try {
    const min = Number(req.params.min);
    if (isNaN(min)) return res.status(400).json({ message: "Invalid rating value" });
    const Recipes = await Recipe.find({ overallRating: { $gte: min } });
    res.status(200).json(Recipes);
  } catch (error) {
    console.error("Error in readRecipeByMinRating", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
};

