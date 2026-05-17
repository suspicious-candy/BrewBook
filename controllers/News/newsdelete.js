import News from "../../models/news.js";

/**
 * DELETE /news/:id
 * Finds a news article by its numeric ID and removes it from the database.
 * Returns 404 if no article matches, 200 with a success message on deletion.
 */
export async function deleteNews(req, res) {
  try {
    const deletedArticle = await News.findOneAndDelete({ID:req.params.id});
    if (!deletedArticle) return res.status(404).json({ message: "News not found" });
    res.status(200).json({ message: "News deleted successfully" });
  } catch (error) {
    console.error("Error in deleteNews", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
}
