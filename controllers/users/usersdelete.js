import user from "../../models/User.jsx";

export async function deleteUsers(req, res) {
  try {
    const deletedUser = await user.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: "user not found" });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error in deleteUsers", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
}
