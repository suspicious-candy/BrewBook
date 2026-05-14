import News from "../../models/news.js";

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