import bean from "../../models/Beans.js";
import User from "../../models/User.js";

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
    const beans = await bean.find({ "details.tasteProfile.Roast": req.params.roast });
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
    const beans = await bean.find({ "details.Varietal": req.params.varietal });
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
    const beans = await bean.find({ "details.Origin.Country": req.params.country });
    res.status(200).json(beans);
  } catch (error) {
    console.error("Error in readBeanByOriginCountry", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
};

/**
 * GET /beans/origin/:country
 * Filters beans by their Origin.Country field (case-sensitive).
 */
export async function readBeanByEmail(req, res) {
  try {
    const foundUser = await User.findOne({ email: req.params.email });
    if (!foundUser) return res.status(404).json({ message: "User not found" });

    // Lazy cleanup: drop beans that have been depleted (Quantity === 0)
    // for more than a week. Beans the user just emptied stick around so
    // they can refill them; only stale ones are removed.
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const stale = await bean.find({
      _id: { $in: foundUser.Beans },
      Quantity: 0,
      depletedAt: { $ne: null, $lt: weekAgo },
    }).select("_id");

    if (stale.length) {
      const staleIds = stale.map((b) => b._id);
      await bean.deleteMany({ _id: { $in: staleIds } });
      await User.findByIdAndUpdate(foundUser._id, {
        $pull: { Beans: { $in: staleIds } },
      });
    }

    const beans = await bean.find({ _id: { $in: foundUser.Beans } });
    res.status(200).json(beans);
  } catch (error) {
    console.error("Error in readBeanByEmail", error);
    res.status(500).json({ message: error.message ?? "Internal Server Issue" });
  }
}

