import News from "../../models/news.js";

export async function createNews(req, res) {
  try {
    const newArticle = new News(req.body);
    const savedArticle = await newArticle.save();
    res.status(201).json(savedArticle);
  } catch (error) {
    console.error("Error in createNews", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
}
