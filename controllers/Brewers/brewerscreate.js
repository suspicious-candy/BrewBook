import Brewer from "../../models/Brewers.js";

/**
 * POST /brewers
 * Creates a new Brewer document from the request body and persists it to MongoDB.
 * Returns the saved document on success, or 500 on a database error.
 */
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
