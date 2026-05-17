import user from "../../models/User.js";
import Brewer from "../../models/Brewers.js";

/**
 * PUT /users/:id
 * Updates a user identified by their numeric UserID with the fields in req.body.
 * If a Brewers array of numeric BrewerIDs is provided, each ID is resolved to an
 * ObjectId before updating — unrecognised IDs return 400. Omitting Brewers from
 * the request body leaves the existing brewer list untouched.
 * Returns 404 if the user does not exist.
 */
export async function updateUsers(req, res) {
  try {
    const { Brewers: brewerIDs, ...rest } = req.body;

    if (brewerIDs !== undefined && brewerIDs.length > 0) {
      const foundBrewers = await Brewer.find({ BrewerID: { $in: brewerIDs } }, "_id BrewerID");
      const foundIDs = new Set(foundBrewers.map((b) => b.BrewerID));
      const missing = brewerIDs.filter((id) => !foundIDs.has(id));
      if (missing.length > 0) {
        return res.status(400).json({ message: `Brewers not found for IDs: ${missing.join(", ")}` });
      }
      rest.Brewers = foundBrewers.map((b) => b._id);
    }

    const updatedUser = await user.findOneAndUpdate({ UserID: req.params.id }, rest, { new: true, runValidators: true });
    if (!updatedUser) return res.status(404).json({ message: "user not found" });
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error in updateUsers", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
}

/**
 * PATCH /users/:id/brewcount
 * Atomically increments LoginData.totalBrewsLogged by 1 for the user with the
 * given numeric UserID, then auto-promotes userLevel based on the new total:
 *   10+ brews → "Barista", 50+ brews → "BrewMaster".
 * Returns 404 if the user does not exist.
 */
export async function updateUserBrewCount(req, res) {
  try {
    const updatedUser = await user.findOneAndUpdate(
      { UserID: req.params.id },
      { $inc: { "LoginData.totalBrewsLogged": 1 } },
      { new: true }
    );
    if (!updatedUser) return res.status(404).json({ message: "user not found" });

    const total = updatedUser.LoginData.totalBrewsLogged;
    let newLevel = "Bean Sprout";
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
