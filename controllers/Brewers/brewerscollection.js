import Brewer from "../../models/Brewers.js";
import User from "../../models/User.js";

// Supabase JWTs identify the user by email; the Mongo User collection keys on
// its own ObjectId. Look up the Mongo user before touching their `Brewers` list.
async function resolveUser(req) {
  const email = req.user?.email;
  if (!email) return null;
  return User.findOne({ email });
}

/**
 * GET /brewers/me
 * Returns the brewers the current user has added to their collection.
 */
export async function readUserBrewers(req, res) {
  try {
    const user = await resolveUser(req);
    if (!user) {
      return res.status(404).json({ message: "No matching user profile found." });
    }
    const brewers = await Brewer.find({ _id: { $in: user.Brewers ?? [] } });
    res.status(200).json(brewers);
  } catch (error) {
    console.error("Error in readUserBrewers", error);
    res.status(500).json({ message: error.message ?? "Internal Server Issue" });
  }
}

/**
 * POST /brewers/me/:brewerId
 * Adds the brewer (by numeric BrewerID) to the user's collection.
 */
export async function addBrewerToUser(req, res) {
  try {
    const user = await resolveUser(req);
    if (!user) {
      return res.status(404).json({ message: "No matching user profile found." });
    }

    const brewer = await Brewer.findOne({ BrewerID: Number(req.params.brewerId) });
    if (!brewer) return res.status(404).json({ message: "Brewer not found" });

    await User.findByIdAndUpdate(user._id, {
      $addToSet: { Brewers: brewer._id },
    });

    res.status(200).json(brewer);
  } catch (error) {
    console.error("Error in addBrewerToUser", error);
    res.status(500).json({ message: error.message ?? "Internal Server Issue" });
  }
}

/**
 * DELETE /brewers/me/:brewerId
 * Removes the brewer (by numeric BrewerID) from the user's collection.
 * The brewer document itself is left intact in the catalog.
 */
export async function removeBrewerFromUser(req, res) {
  try {
    const user = await resolveUser(req);
    if (!user) {
      return res.status(404).json({ message: "No matching user profile found." });
    }

    const brewer = await Brewer.findOne({ BrewerID: Number(req.params.brewerId) });
    if (!brewer) return res.status(404).json({ message: "Brewer not found" });

    await User.findByIdAndUpdate(user._id, {
      $pull: { Brewers: brewer._id },
    });

    res.status(200).json({ message: "Brewer removed from collection" });
  } catch (error) {
    console.error("Error in removeBrewerFromUser", error);
    res.status(500).json({ message: error.message ?? "Internal Server Issue" });
  }
}
