import Recipe from "../../models/recipe.js";

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
    const Recipes = await Recipe.findById(req.params.ID);
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
    const Recipes = await Recipe.find({ "Brewer": req.params.Brewer });
    res.status(200).json(Recipes) 
  }
  catch(error){
    console.error("Error in the readRecipeByBrewer",error);
    res.status(500).json({message:"Internal Server Issue"})
  }
};

export async function readRecipeByBean(req, res) {
  try{
    const Recipes = await Recipe.find({ "bean": req.params.bean });
    res.status(200).json(Recipes)
  }
  catch(error){
    console.error("Error in the readRecipeByBean",error);
    res.status(500).json({message:"Internal Server Issue"})
  }
};

export async function readRecipeByMinRating(req, res) {
  try {
    const Recipes = await Recipe.find({ overallRating: { $gte: Number(req.params.min) } });
    res.status(200).json(Recipes);
  } catch (error) {
    console.error("Error in readRecipeByMinRating", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
};

export async function readRecipeByGrindSize(req, res) {
  try {
    const Recipes = await Recipe.find({ grindSize: Number(req.params.size) });
    res.status(200).json(Recipes);
  } catch (error) {
    console.error("Error in readRecipeByGrindSize", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
};

