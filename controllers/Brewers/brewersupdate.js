import Brewer from "../../models/Brewers.js";

export async function updateBrewers(req, res) {
  try {
    const updatedBrewer = await Brewer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedBrewer) return res.status(404).json({ message: "Brewer not found" });
    res.status(200).json(updatedBrewer);
  } catch (error) {
    console.error("Error in updateBrewers", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
}
