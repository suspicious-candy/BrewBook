import Notes from "../../models/notes.js";
import Recipe from "../../models/recipe.js";
import User from "../../models/User.js";

/**
 * POST /notes
 * Creates a new Notes (tasting note) document. If recipeId is provided in the
 * request body, it is resolved to a MongoDB ObjectId before saving.
 * Returns 404 if the referenced recipe does not exist, or 500 on a database error.
 */
export async function createNotes(req, res) {
  try {
    // Accept either a numeric recipeId or a direct Recipe ObjectId.
    const { recipeId, Recipe: incomingRecipeRef, beanId, brewerId, ...rest } = req.body;

    let recipeObjectId = incomingRecipeRef;
    if (recipeId !== undefined) {
      const recipeObj = await Recipe.findOne({ ID: recipeId });
      if (!recipeObj) return res.status(404).json({ message: "Recipe not found" });
      recipeObjectId = recipeObj._id;
    }

    // Resolve the Mongo user from the Supabase JWT email so dashboard
    // queries that filter by `User: user._id` can find this note.
    const email = req.user?.email;
    const userDoc = email ? await User.findOne({ email }) : null;

    // The Notes schema requires a unique numeric ID — auto-assign the next
    // sequential one if the client didn't pass it.
    let nextId = rest.ID;
    if (nextId === undefined) {
      const last = await Notes.findOne().sort({ ID: -1 }).select("ID");
      nextId = last ? last.ID + 1 : 1;
    }

    const newNote = new Notes({
      ...rest,
      ID: nextId,
      Recipe: recipeObjectId,
      User: userDoc?._id,
    });
    const savedNote = await newNote.save();

    // Point the user's LastBrew at the new note + bump streak/totals so the
    // dashboard updates as soon as the brew starts, even before tasting notes
    // are logged.
    if (userDoc) {
      const now = new Date();
      const startOfDay = (d) => {
        const x = new Date(d);
        x.setHours(0, 0, 0, 0);
        return x;
      };

      const prevLogin = userDoc.LoginData?.lastLogin;
      const prevStreak = userDoc.LoginData?.streak ?? 0;

      let streak;
      if (!prevLogin) {
        streak = 1;
      } else {
        const dayDiff = Math.round(
          (startOfDay(now) - startOfDay(prevLogin)) / 86400000
        );
        if (dayDiff === 0) streak = prevStreak || 1; // same day, keep streak
        else if (dayDiff === 1) streak = prevStreak + 1; // consecutive day
        else streak = 1; // gap in days, reset
      }

      await User.findByIdAndUpdate(userDoc._id, {
        LastBrew: savedNote._id,
        "LoginData.lastLogin": now,
        "LoginData.streak": streak,
      });
    }

    res.status(201).json(savedNote);
  } catch (error) {
    console.error("Error in createNotes", error);
    res.status(500).json({ message: error.message ?? "Internal Server Issue" });
  }
}