import bean from "../../models/Beans.js";

export async function readBeans (req, res) {
  try{
    const beans = await bean.find();
    res.status(200).json(beans) 
  }
  catch(error){
    console.error("Error in the bean readBeans",error);
    res.status(500).json({message:"Internal Server Issue"})
  }
};

export async function readBeanByID (req, res) {
  try{
    const beans = await bean.findById(req.params.id);
    if (!beans) return res.status(404).json({ message: "Bean not found" });
    res.status(200).json(beans);
  }
  catch(error){
    console.error("Error in the bean readBean ID",error);
    res.status(500).json({message:"Internal Server Issue"})
  }
};

export async function readBeanByRoast(req, res) {
  try{
    const beans = await bean.find({ "tasteProfile.Roast": req.params.roast });
    res.status(200).json(beans) 
  }
  catch(error){
    console.error("Error in the readBeans by roast",error);
    res.status(500).json({message:"Internal Server Issue"})
  }
};

