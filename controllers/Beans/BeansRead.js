import bean from "../../models/Beans.js";

export async function readBeans (req, res) {
  try{
    const beans = await bean.find();
    res.status(200).json(bean) 
  }
  catch(error){
    console.error("Error in the bean readBeans",error);
    res.status(500).json({message:"Internal Server Issue"})
  }
};

export async function readBeanByID (req, res) {
  try{
    const beans = await bean.findById(req.params.id);
    res.status(200).json(bean) 
  }
  catch(error){
    console.error("Error in the bean readBean ID",error);
    res.status(500).json({message:"Internal Server Issue"})
  }
};

export async function readBeanByRoast(req, res) {
  try{
    const beans = await bean.findByRoast(req.params.id);
    res.status(200).json(bean) 
  }
  catch(error){
    console.error("Error in the bean readBeans by Raost",error);
    res.status(500).json({message:"Internal Server Issue"})
  }
};

