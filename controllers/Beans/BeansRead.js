import bean from "../../models/Beans.js";

/**
 * GET /beans
 * Returns all Bean documents in the collection.
 */
export async function readBeans (req, res) {
  try{
    const beans = await bean.find();
    res.status(200).json(beans) 
  }
  catch(error){
    console.error("Error in the bean readBeans",error);
    res.status(500).json({message:"Internal Server Issue"})
  }
};

/**
 * GET /beans/:id
 * Returns the bean whose numeric beanId matches req.params.id.
 * Returns 404 if no bean is found.
 */
export async function readBeanByID (req, res) {
  try{
    const beans = await bean.findOne({beanId : req.params.id});
    if (!beans) return res.status(404).json({ message: "Bean not found" });
    res.status(200).json(beans);
  }
  catch(error){
    console.error("Error in the bean readBean ID",error);
    res.status(500).json({message:"Internal Server Issue"})
  }
};

/**
 * GET /beans/roast/:roast
 * Filters beans by tasteProfile.Roast (e.g. "light", "medium", "dark").
 */
export async function readBeanByRoast(req, res) {
  try{
    const beans = await bean.find({ "tasteProfile.Roast": req.params.roast });
    res.status(200).json(beans)
  }
  catch(error){
    console.error("Error in the readBeans by roast",error);
    res.status(500).json({message:"Internal Server Issue"})
  }
};

/**
 * GET /beans/varietal/:varietal
 * Filters beans by their Varietal field (e.g. "Gesha", "Typica").
 */
export async function readBeanByVarietal(req, res) {
  try {
    const beans = await bean.find({ Varietal: req.params.varietal });
    res.status(200).json(beans);
  } catch (error) {
    console.error("Error in readBeanByVarietal", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
};

/**
 * GET /beans/origin/:country
 * Filters beans by their Origin.Country field (case-sensitive).
 */
export async function readBeanByOriginCountry(req, res) {
  try {
    const beans = await bean.find({ "Origin.Country": req.params.country });
    res.status(200).json(beans);
  } catch (error) {
    console.error("Error in readBeanByOriginCountry", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
};

