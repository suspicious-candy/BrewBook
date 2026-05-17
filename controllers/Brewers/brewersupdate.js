import Brewer from "../../models/Brewers.js";

/**
 * PUT /brewers/:id
 * Updates a brewer document identified by its numeric BrewerID with the fields in req.body.
 * Runs Mongoose validators on the updated fields. Returns 404 if the brewer does not exist.
 */
export async function updateBrewers(req, res) {
  try {
    const updatedBrewer = await Brewer.findOneAndUpdate({BrewerID:req.params.id}, req.body, { new: true, runValidators: true });
    if (!updatedBrewer) return res.status(404).json({ message: "Brewer not found" });
    res.status(200).json(updatedBrewer);
  } catch (error) {
    console.error("Error in updateBrewers", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
}
