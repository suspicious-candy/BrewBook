import user from "../../models/User.js";
import Brewer from "../../models/Brewers.js";

export async function updateUsers(req, res) {
  try {
    const { Brewers: brewerIDs, ...rest } = req.body;
    
        let brewerObjectIds = [];
        if (brewerIDs && brewerIDs.length > 0) {
          const foundBrewers = await Brewer.find({ BrewerID: { $in: brewerIDs } }, "_id BrewerID");
          const foundIDs = new Set(foundBrewers.map((b) => b.BrewerID));
          const missing = brewerIDs.filter((id) => !foundIDs.has(id));
          if (missing.length > 0) {
            return res.status(400).json({ message: `Brewers not found for IDs: ${missing.join(", ")}` });
          }
          brewerObjectIds = foundBrewers.map((b) => b._id);
        }
    
    const updatedUser = await user.findOneAndUpdate({UserID:req.params.id},{...rest, Brewers: brewerObjectIds}, { new: true, runValidators: true });
    if (!updatedUser) return res.status(404).json({ message: "user not found" });
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error in updateUsers", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
}

export async function updateUserBrewCount(req, res) {
  try {
    const updatedUser = await user.findOneAndUpdate(
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
