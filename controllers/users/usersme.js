import User from "../../models/User.js";
import Notes from "../../models/notes.js";

/**
 * GET /users/me
 * Returns the authenticated user's profile, resolved from the Supabase JWT
 * email. Runs after ensureUser, so the document is guaranteed to exist.
 */
export async function getMe(req, res) {
  try {
    if (!req.user?.email) {
      return res.status(401).json({ message: "Token missing email claim" });
    }

    const me = await User.findOne({ email: req.user.email }).select("-password");
    if (!me) return res.status(404).json({ message: "User not found" });

    res.status(200).json(me);
  } catch (error) {
    console.error("Error in getMe", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
}

/**
 * GET /users/me/stats
 * Aggregates the authenticated user's brewing stats from their tasting notes.
 * Favorites use the numeric public IDs (beanId / BrewerID / recipe.ID) so the
 * profile screen can deep-link straight into the matching detail route.
 */
export async function getMyStats(req, res) {
  try {
    if (!req.user?.email) {
      return res.status(401).json({ message: "Token missing email claim" });
    }

    const me = await User.findOne({ email: req.user.email }).select("_id LoginData");
    if (!me) return res.status(404).json({ message: "User not found" });

    const notes = await Notes.find({ User: me._id })
      .select("overallRating Recipe")
      .populate({
        path: "Recipe",
        select: "ID Name Brewer bean",
        populate: [
          { path: "Brewer", select: "BrewerID Name" },
          { path: "bean", select: "beanId details.Name" },
        ],
      });

    const totalBrews = notes.length;

    const rated = notes.filter((n) => typeof n.overallRating === "number");
    const avgRating = rated.length
      ? rated.reduce((sum, n) => sum + n.overallRating, 0) / rated.length
      : null;

    // Tally how often each bean / brewer / recipe appears to surface favorites.
    const beans = new Map();
    const brewers = new Map();
    const recipes = new Map();

    const bump = (map, key, value) => {
      if (key == null) return;
      const entry = map.get(key) ?? { count: 0, ...value };
      entry.count += 1;
      map.set(key, entry);
    };

    for (const note of notes) {
      const recipe = note.Recipe;
      if (!recipe) continue;
      bump(recipes, String(recipe._id), { name: recipe.Name, id: recipe.ID });
      if (recipe.bean) {
        bump(beans, String(recipe.bean._id), {
          name: recipe.bean.details?.Name,
          id: recipe.bean.beanId,
        });
      }
      if (recipe.Brewer) {
        bump(brewers, String(recipe.Brewer._id), {
          name: recipe.Brewer.Name,
          id: recipe.Brewer.BrewerID,
        });
      }
    }

    const top = (map) => {
      let best = null;
      for (const entry of map.values()) {
        if (!best || entry.count > best.count) best = entry;
      }
      return best;
    };

    const favBean = top(beans);
    const favBrewer = top(brewers);
    const favRecipe = top(recipes);

    res.status(200).json({
      totalBrews,
      uniqueBeans: beans.size,
      activeStreak: me.LoginData?.streak ?? 0,
      avgRating,
      favoriteBean: favBean?.name ?? null,
      favoriteBeanId: favBean?.id ?? null,
      favoriteBrewer: favBrewer?.name ?? null,
      favoriteBrewerId: favBrewer?.id ?? null,
      favoriteRecipe: favRecipe?.name ?? null,
      favoriteRecipeId: favRecipe?.id ?? null,
    });
  } catch (error) {
    console.error("Error in getMyStats", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
}
