import bean from "../../models/Beans.js";

export async function deleteBeans(req, res) {
  try {

    const deletedBean = await bean.findByIdAndDelete(req.params.id);

    if (!deletedBean) return res.status(404).json({ message: "Bean not found" });
    res.status(200).json({ message: "Bean deleted successfully" });

  } catch (error) {

    console.error("Error in deleteBeans", error);
    res.status(500).json({ message: "Internal Server Issue" });
    
  }
}
