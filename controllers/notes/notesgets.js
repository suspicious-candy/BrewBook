import Notes from "../../models/notes.js";

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
    const notes = await Notes.findById(req.params.ID);
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
    const notes = await Notes.find({ Brewer: req.params.id });
    res.status(200).json(notes);
  } catch (error) {
    console.error("Error in readNotesByBrewer", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
};

export async function readNotesByBean(req, res) {
  try {
    const notes = await Notes.find({ bean: req.params.id });
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