import News from "../../models/news.js";

export async function readNews (req, res) {
  try{
    const News = await News.find();
    res.status(200).json(News) 
  }
  catch(error){
    console.error("Error in the  readNews",error);
    res.status(500).json({message:"Internal Server Issue"})
  }
};

export async function readNewsByID (req, res) {
  try{
    const News = await News.findById(req.params.BrewerID);
    if (!News) return res.status(404).json({ message: "News not found" });
    res.status(200).json(News);
  }
  catch(error){
    console.error("Error in the  readNewsByID ",error);
    res.status(500).json({message:"Internal Server Issue"})
  }
};

export async function readBrewerByAuthor(req, res) {
  try{
    const News = await News.find({ "Author": req.params.Author });
    res.status(200).json(News) 
  }
  catch(error){
    console.error("Error in the readBrewerByAuthor",error);
    res.status(500).json({message:"Internal Server Issue"})
  }
};