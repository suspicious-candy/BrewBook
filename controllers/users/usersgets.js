import user from "../../models/User.js";

export async function getUsers (req, res) {
  try{
    const User = await user.find();
    res.status(200).json(User) 
  }
  catch(error){
    console.error("Error in the getUsers",error);
    res.status(500).json({message:"Internal Server Issue"})
  }
};

export async function getUserByID (req, res) {
  try{
    const User = await user.findOne({UserID:req.params.id});
    if (!User) return res.status(404).json({ message: "user not found" });
    res.status(200).json(User);
  }
  catch(error){
    console.error("Error in the  getUserByID ",error);
    res.status(500).json({message:"Internal Server Issue"})
  }
};

export async function getUserByEmail(req, res) {
  try {
    const User = await user.findOne({ email: req.params.email });
    if (!User) return res.status(404).json({ message: "user not found" });
    res.status(200).json(User);
  } catch (error) {
    console.error("Error in getUserByEmail", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
};

export async function getUserByLevel(req, res) {
  try {
    const Users = await user.find({ userLevel: req.params.level });
    res.status(200).json(Users);
  } catch (error) {
    console.error("Error in getUserByLevel", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
};

