import Notes from "../../models/notes.js";

export async function deleteNotes(req, res) {
  try {
    const deletedNote = await Notes.findByIdAndDelete(req.params.id);
    if (!deletedNote) return res.status(404).json({ message: "Notes not found" });
    res.status(200).json({ message: "Notes deleted successfully" });
  } catch (error) {
    console.error("Error in deleteNotes", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
}
