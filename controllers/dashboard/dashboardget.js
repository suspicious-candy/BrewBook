import User from "../../models/User.js";
import Notes from "../../models/notes.js";

export const getDashboard = async (req, res) => {
  try {
    if (!req.user.email) {
      return res.status(401).json({ message: "Token missing email claim" });
    }

    const user = await User.findOne({ email: req.user.email })
      .select("firstName lastName LoginData LastBrew Beans")
      .populate({
        path: "Beans",
        select: "beanId details Quantity createdAt",
        options: { sort: { createdAt: -1 } },
      })
      .populate({
        path: "LastBrew",
        select: "ID Date overallRating CoffeeIn WaterIn BrewTime Recipe",
        populate: {
          path: "Recipe",
          select: "ID Brewer bean",
          populate: [
            { path: "Brewer", select: "Name" },
            { path: "bean", select: "details Quantity beanId" },
          ],
        },
      });

    if (!user) return res.status(404).json({ message: "User not found" });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const brewsToday = await Notes.countDocuments({
      User: user._id,
      Date: { $gte: startOfToday },
    });

    const lastBrew = user.LastBrew;
    const recipe = lastBrew?.Recipe ?? null;
    const brewBean = recipe?.bean ?? null;

    const fallbackBean = !brewBean && user.Beans?.length ? user.Beans[0] : null;
    const sourceBean = brewBean ?? fallbackBean;

    const beanSupply = sourceBean
      ? {
          name: sourceBean.details?.Name,
          beanId: sourceBean.beanId,
          remaining: sourceBean.Quantity,
          capacity: null,
        }
      : null;

    res.status(200).json({
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
      },
      beans: user.Beans,
      lastBrew: lastBrew
        ? {
            ID: lastBrew.ID,
            Date: lastBrew.Date,
            overallRating: lastBrew.overallRating,
            CoffeeIn: lastBrew.CoffeeIn,
            WaterIn: lastBrew.WaterIn,
            BrewTime: lastBrew.BrewTime,
            Recipe: recipe
              ? {
                  ID: recipe.ID,
                  Brewer: recipe.Brewer ? { Name: recipe.Brewer.Name } : null,
                  bean: brewBean
                    ? { Name: brewBean.details?.Name, Quantity: brewBean.Quantity, beanId: brewBean.beanId }
                    : null,
                }
              : null,
          }
        : null,
      brewsToday,
      streak: user.LoginData?.streak ?? 0,
      beanSupply,
    });
  } catch (error) {
    console.error("Error in getDashboard", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
