import Brewer from "../../models/Brewers.js";

export async function deleteBrewers(req, res) {
  try {
    const deletedBrewer = await Brewer.findOneAndDelete({BrewerID:req.params.id});
    if (!deletedBrewer) return res.status(404).json({ message: "Brewer not found" });
    res.status(200).json({ message: "Brewer deleted successfully" });
  } catch (error) {
    console.error("Error in deleteBrewers", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
}
