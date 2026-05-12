import user from "../../models/User.jsx";

export async function createUsers(req, res) {
  try {
    const newUser = new user(req.body);
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    console.error("Error in createUsers", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
}
