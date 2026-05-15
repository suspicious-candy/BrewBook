import Recipe from "../../models/recipe.js";
import Brewer from "../../models/Brewers.js";
import bean from "../../models/Beans.js";

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

