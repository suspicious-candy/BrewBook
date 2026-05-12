import Brewer from "../../models/Brewers.js";

export async function createBrewers(req, res) {
  try {
    const newBrewer = new Brewer(req.body);
    const savedBrewer = await newBrewer.save();
    res.status(201).json(savedBrewer);
  } catch (error) {
    console.error("Error in createBrewers", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
}
