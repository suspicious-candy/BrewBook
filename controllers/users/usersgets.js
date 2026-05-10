import user from "../../models/User.jsx";

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
    const User = await user.findById(req.params.UserID);
    if (!User) return res.status(404).json({ message: "user not found" });
    res.status(200).json(User);
  }
  catch(error){
    console.error("Error in the  getUserByID ",error);
    res.status(500).json({message:"Internal Server Issue"})
  }
};

