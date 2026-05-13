import bean from "../../models/Beans.js";

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

export async function updateBeanLastBrew(req, res) {
  try {
    const { recipe, Brewer, note } = req.body;
    const updatedBean = await bean.findByIdAndUpdate(
      req.params.id,
      { lastBrew: { recipe, Brewer, note } },
      { new: true, runValidators: true }
    );
    if (!updatedBean) return res.status(404).json({ message: "Bean not found" });
    res.status(200).json(updatedBean);
  } catch (error) {
    console.error("Error in updateBeanLastBrew", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
}
