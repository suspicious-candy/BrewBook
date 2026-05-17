import user from "../../models/User.js";

/**
 * GET /users
 * Returns all User documents in the collection.
 */
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

/**
 * GET /users/:id
 * Returns the user whose numeric UserID matches req.params.id.
 * Returns 404 if no user is found.
 */
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

/**
 * GET /users/email/:email
 * Returns the user whose email address matches req.params.email.
 * Returns 404 if no user is found.
 */
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

/**
 * GET /users/level/:level
 * Returns all users whose userLevel matches req.params.level
 * ("Bean Sprout", "Barista", or "BrewMaster").
 */
export async function getUserByLevel(req, res) {
  try {
    const Users = await user.find({ userLevel: req.params.level });
    res.status(200).json(Users);
  } catch (error) {
    console.error("Error in getUserByLevel", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
};

