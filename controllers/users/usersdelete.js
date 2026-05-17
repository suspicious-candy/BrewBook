import user from "../../models/User.js";

/**
 * DELETE /users/:id
 * Finds a user by their numeric UserID and removes them from the database.
 * Returns 404 if no user matches, 200 with a success message on deletion.
 */
export async function deleteUsers(req, res) {
  try {
    const deletedUser = await user.findOneAndDelete({ UserID: req.params.id });
    if (!deletedUser) return res.status(404).json({ message: "user not found" });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error in deleteUsers", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
}
