import News from "../../models/news.js";

/**
 * GET /news
 * Returns all News article documents in the collection.
 */
export async function readNews (req, res) {
  try{
    const news = await News.find();
    res.status(200).json(news) 
  }
  catch(error){
    console.error("Error in the readNews",error);
    res.status(500).json({message:"Internal Server Issue"})
  }
};

/**
 * GET /news/:id
 * Returns the news article whose numeric ID matches req.params.id.
 * Returns 404 if no article is found.
 */
export async function readNewsByID (req, res) {
  try{
    const news = await News.findOne({ID:req.params.id});
    if (!news) return res.status(404).json({ message: "News not found" });
    res.status(200).json(news);
  }
  catch(error){
    console.error("Error in the  readNewsByID ",error);
    res.status(500).json({message:"Internal Server Issue"})
  }
};

/**
 * GET /news/author/:Author
 * Returns all news articles whose Author field matches req.params.Author (case-sensitive).
 */
export async function readNewsByAuthor(req, res) {
  try{
    const news = await News.find({ "Author": req.params.Author });
    res.status(200).json(news) 
  }
  catch(error){
    console.error("Error in the readNewsByAuthor",error);
    res.status(500).json({message:"Internal Server Issue"})
  }
};