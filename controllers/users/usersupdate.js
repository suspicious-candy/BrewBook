import user from "../../models/User.jsx";

export async function updateUsers(req, res) {
  try {
    const updatedUser = await user.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedUser) return res.status(404).json({ message: "user not found" });
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error in updateUsers", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
}

export async function updateUserBrewCount(req, res) {
  try {
    const updatedUser = await user.findByIdAndUpdate(
      req.params.id,
      { $inc: { "LoginData.totalBrewsLogged": 1 } },
      { new: true }
    );
    if (!updatedUser) return res.status(404).json({ message: "user not found" });

    const total = updatedUser.LoginData.totalBrewsLogged;
    let newLevel = "Bean Sprout ";
    if (total >= 50) newLevel = "BrewMaster";
    else if (total >= 10) newLevel = "Barista";

    if (updatedUser.userLevel !== newLevel) {
      updatedUser.userLevel = newLevel;
      await updatedUser.save();
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error in updateUserBrewCount", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
}
