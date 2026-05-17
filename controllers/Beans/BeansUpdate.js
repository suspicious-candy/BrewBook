import bean from "../../models/Beans.js";
import Notes from "../../models/notes.js";

/**
 * PUT /beans/:id
 * Updates a bean document identified by its numeric beanId with the fields in req.body.
 * Runs Mongoose validators on the updated fields. Returns 404 if the bean does not exist.
 */
export async function updateBeans(req, res) {
  try {
    const updatedBean = await bean.findOneAndUpdate({beanId:req.params.id}, req.body, { new: true, runValidators: true });
    if (!updatedBean) return res.status(404).json({ message: "Bean not found" });
    res.status(200).json(updatedBean);
  } catch (error) {
    console.error("Error in updateBeans", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
}

/**
 * PATCH /beans/:id/lastBrew
 * Sets the bean's lastBrew.note reference to the ObjectId of the Note
 * whose numeric ID matches req.body.noteId.
 * Returns 400 if noteId is missing, 404 if either the note or bean is not found.
 */
export async function updateBeanLastBrew(req, res) {
  try {
    const { noteId } = req.body;
    if (noteId === undefined) return res.status(400).json({ message: "noteId is required" });

    const noteObj = await Notes.findOne({ ID: noteId });
    if (!noteObj) return res.status(404).json({ message: "Note not found" });

    const updatedBean = await bean.findOneAndUpdate(
      { beanId: req.params.id },
      { "lastBrew.note": noteObj._id },
      { new: true }
    );
    if (!updatedBean) return res.status(404).json({ message: "Bean not found" });
    res.status(200).json(updatedBean);
  } catch (error) {
    console.error("Error in updateBeanLastBrew", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
}
