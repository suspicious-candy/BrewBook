import user from "../../models/User.js";
import Brewer from "../../models/Brewers.js";

export async function createUsers(req, res) {
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

    const newUser = new user({ ...rest, Brewers: brewerObjectIds });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    console.error("Error in createUsers", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
}
