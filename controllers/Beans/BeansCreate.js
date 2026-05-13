import bean from "../../models/Beans.js";

export async function createBeans(req, res) {
  try {
    const {beanId,Name,Origin,Varietal,Process,Altitude,preferences,trackedParameters,RoastDate,Quantity,tasteProfile,lastBrew} = req.body;
    const newBean = new bean({beanId,Name,Origin,Varietal,Process,Altitude,preferences,trackedParameters,RoastDate,Quantity,tasteProfile,lastBrew});
    const savedBean = await newBean.save();

    res.status(201).json(savedBean);

  } catch (error) {

    console.error("Error in createBeans", error);
    res.status(500).json({ message: "Internal Server Issue" });
    
  }
}
