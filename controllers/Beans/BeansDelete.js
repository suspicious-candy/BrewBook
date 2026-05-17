import bean from "../../models/Beans.js";

/**
 * DELETE /beans/:id
 * Finds a bean by its numeric beanId and removes it from the database.
 * Returns 404 if no bean matches, 200 with a success message on deletion.
 */
export async function deleteBeans(req, res) {
  try {

    const deletedBean = await bean.findOneAndDelete({ beanId: req.params.id });

    if (!deletedBean) return res.status(404).json({ message: "Bean not found" });
    res.status(200).json({ message: "Bean deleted successfully" });

  } catch (error) {

    console.error("Error in deleteBeans", error);
    res.status(500).json({ message: "Internal Server Issue" });
    
  }
}
