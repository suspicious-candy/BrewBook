import bean from "../../models/Beans.js";

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
