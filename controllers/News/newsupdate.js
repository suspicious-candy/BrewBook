import News from "../../models/news.js";

export async function updateNews(req, res) {
  try {
    const updatedArticle = await News.findOneAndUpdate({ID:req.params.id}, req.body, { new: true, runValidators: true });
    if (!updatedArticle) return res.status(404).json({ message: "News not found" });
    res.status(200).json(updatedArticle);
  } catch (error) {
    console.error("Error in updateNews", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
}
