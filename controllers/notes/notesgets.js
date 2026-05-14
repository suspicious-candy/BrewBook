import Notes from "../../models/notes.js";
import Brewer from "../../models/Brewers.js";
import bean from "../../models/Beans.js";

export async function getNotes (req, res) {
  try{
    const notes = await Notes.find();
    res.status(200).json(notes) 
  }
  catch(error){
    console.error("Error in the  getNotes",error);
    res.status(500).json({message:"Internal Server Issue"})
  }
};

export async function readNotesByID (req, res) {
  try{
    const notes = await Notes.findOne({ID:req.params.id});
    if (!notes) return res.status(404).json({ message: "Notes not found" });
    res.status(200).json(notes);
  }
  catch(error){
    console.error("Error in the  readNotesByID ",error);
    res.status(500).json({message:"Internal Server Issue"})
  }
};

export async function readNotesByBrewer(req, res) {
  try {
    let brewerObjectId;
    if (req.params.id !== undefined) {
      const brewer = await Brewer.findOne({ BrewerID : req.params.id });

      if (!brewer) return res.status(404).json({ message: "Brewer not found" });
      brewerObjectId = brewer._id;
    }
    const notes = await Notes.find({ Brewer: brewerObjectId });
    res.status(200).json(notes);
  } catch (error) {
    console.error("Error in readNotesByBrewer", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
};

export async function readNotesByBean(req, res) {
  try {
    let beanObjectId;
    if (req.params.id !== undefined) {
      const BeanObj = await bean.findOne({ beanId : req.params.id });
      if (!BeanObj) return res.status(404).json({ message: "bean not found" });
      beanObjectId = BeanObj._id;
    }
    const notes = await Notes.find({ bean: beanObjectId });
    res.status(200).json(notes);
  } catch (error) {
    console.error("Error in readNotesByBean", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
};

export async function readNotesByMinRating(req, res) {
  try {
    const notes = await Notes.find({ overallRating: { $gte: Number(req.params.min) } });
    res.status(200).json(notes);
  } catch (error) {
    console.error("Error in readNotesByMinRating", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
};