import Notes from "../../models/notes.js";

/**
 * DELETE /notes/:id
 * Finds a tasting note by its numeric ID and removes it from the database.
 * Returns 404 if no note matches, 200 with a success message on deletion.
 */
export async function deleteNotes(req, res) {
  try {
    const deletedNote = await Notes.findOneAndDelete({ID:req.params.id});
    if (!deletedNote) return res.status(404).json({ message: "Notes not found" });
    res.status(200).json({ message: "Notes deleted successfully" });
  } catch (error) {
    console.error("Error in deleteNotes", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
}
