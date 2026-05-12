import News from "../../models/news.js";

export async function deleteNews(req, res) {
  try {
    const deletedArticle = await News.findByIdAndDelete(req.params.id);
    if (!deletedArticle) return res.status(404).json({ message: "News not found" });
    res.status(200).json({ message: "News deleted successfully" });
  } catch (error) {
    console.error("Error in deleteNews", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
}
