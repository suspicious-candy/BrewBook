import User from "../models/User.js";

// Runs after Authorization. If no MongoDB User exists for the Supabase JWT,
// create one using the email and user_metadata captured at signup.
export const ensureUser = async (req, res, next) => {
  try {
    if (!req.user?.email) {
      return res.status(401).json({ message: "Token missing email claim" });
    }

    const existing = await User.findOne({ email: req.user.email }).select("_id");
    if (existing) return next();

    const meta = req.user.user_metadata ?? {};
    await User.create({
      email: req.user.email,
      firstName: meta.first_name ?? meta.firstName ?? "New",
      lastName: meta.last_name ?? meta.lastName ?? "User",
    });

    next();
  } catch (err) {
    // Race: another request just created the row. Treat as success.
    if (err?.code === 11000) return next();
    console.error("ensureUser failed", err);
    res.status(500).json({ message: "Could not provision user" });
  }
};
