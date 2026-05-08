import Brewer from "../../models/Brewers.js";

export async function readBrewers (req, res) {
  try{
    const Brewers = await Brewer.find();
    res.status(200).json(Brewers) 
  }
  catch(error){
    console.error("Error in the bean readBrewers",error);
    res.status(500).json({message:"Internal Server Issue"})
  }
};

export async function readBrewerByID (req, res) {
  try{
    const Brewer = await Brewer.findById(req.params.BrewerID);
    if (!Brewer) return res.status(404).json({ message: "Brewer not found" });
    res.status(200).json(Brewer);
  }
  catch(error){
    console.error("Error in the bean readBrewerByID ID",error);
    res.status(500).json({message:"Internal Server Issue"})
  }
};

export async function readBrewerByType(req, res) {
  try{
    const Brewers = await Brewer.find({ "filterType": req.params.filterType });
    res.status(200).json(Brewers) 
  }
  catch(error){
    console.error("Error in the bean readBrewerByType",error);
    res.status(500).json({message:"Internal Server Issue"})
  }
};

