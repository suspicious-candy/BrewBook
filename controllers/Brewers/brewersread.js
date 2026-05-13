import Brewer from "../../models/Brewers.js";

export async function readBrewers (req, res) {
  try{
    const Brewers = await Brewer.find();
    res.status(200).json(Brewers) 
  }
  catch(error){
    console.error("Error in the readBrewers",error);
    res.status(500).json({message:"Internal Server Issue"})
  }
};

export async function readBrewerByID (req, res) {
  try{
    const brewer = await Brewer.findOne({ BrewerID: req.params.id });
    if (!brewer) return res.status(404).json({ message: "Brewer not found" });
    res.status(200).json(brewer);
  }
  catch(error){
    console.error("Error in the readBrewerByID",error);
    res.status(500).json({message:"Internal Server Issue"})
  }
};

export async function readBrewerByType(req, res) {
  try{
    const Brewers = await Brewer.find({ "filterType": req.params.filterType });
    res.status(200).json(Brewers) 
  }
  catch(error){
    console.error("Error in the readBrewerByType",error);
    res.status(500).json({message:"Internal Server Issue"})
  }
};

