import Notes from "../../models/notes.js";

export async function createNotes(req, res) {
  try {
    const newNote = new Notes(req.body);
    const savedNote = await newNote.save();
    res.status(201).json(savedNote);
  } catch (error) {
    console.error("Error in createNotes", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
}
