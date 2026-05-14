import Notes from "../../models/notes.js";

export async function updateNotes(req, res) {
  try {
    const updatedNote = await Notes.findOneAndUpdate({ID:req.params.id}, req.body, { new: true, runValidators: true });
    if (!updatedNote) return res.status(404).json({ message: "Notes not found" });
    res.status(200).json(updatedNote);
  } catch (error) {
    console.error("Error in updateNotes", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
}
