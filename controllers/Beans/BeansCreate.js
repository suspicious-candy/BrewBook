import bean from "../../models/Beans.js";

/**
 * POST /beans
 * Creates a new Bean document from the request body and persists it to MongoDB.
 * Returns the saved document on success, or 500 on a database error.
 */
export async function createBeans(req, res) {
  try {
    const newBean = new bean(req.body);
    const savedBean = await newBean.save();

    res.status(201).json(savedBean);

  } catch (error) {

    console.error("Error in createBeans", error);
    res.status(500).json({ message: "Internal Server Issue" });
    
  }
}
