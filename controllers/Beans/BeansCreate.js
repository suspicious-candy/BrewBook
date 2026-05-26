import bean from "../../models/Beans.js";
import User from "../../models/User.js";

function identityQueryFor(ownerId, details = {}) {
  return {
    owner: ownerId,
    "details.Name": details.Name,
    "details.Origin.Country": details.Origin?.Country ?? "none",
    "details.Origin.Region": details.Origin?.Region ?? "none",
    "details.Varietal": details.Varietal,
    "details.Process": details.Process ?? "wash",
    "details.RoastDate": details.RoastDate,
  };
}

// Supabase JWTs identify users by UUID (`sub`) and email. The Mongo User
// collection keys on its own ObjectId, so we resolve the Mongo user by
// email before using their `_id` as the bean owner.
async function resolveOwnerId(req) {
  const email = req.user?.email;
  if (!email) return null;
  const user = await User.findOne({ email });
  return user?._id ?? null;
}

export async function createBeans(req, res) {
  try {
    const ownerId = await resolveOwnerId(req);
    if (!ownerId) {
      return res.status(404).json({
        message: "No matching user profile found. Create a user record first.",
      });
    }

    const { details, ...rest } = req.body;
    const idQuery = identityQueryFor(ownerId, details);

    const existing = await bean.findOne(idQuery);
    if (existing) {
      await User.findByIdAndUpdate(ownerId, { $addToSet: { Beans: existing._id } });
      return res.status(200).json(existing);
    }

    const lastBean = await bean.findOne().sort({ beanId: -1 }).select("beanId");
    const nextId = lastBean ? lastBean.beanId + 1 : 1;

    const newBean = await new bean({ ...rest, details, beanId: nextId, owner: ownerId }).save();
    await User.findByIdAndUpdate(ownerId, { $addToSet: { Beans: newBean._id } });

    res.status(201).json(newBean);
  } catch (error) {
    if (error.code === 11000) {
      const ownerId = await resolveOwnerId(req);
      if (ownerId) {
        const existing = await bean.findOne(identityQueryFor(ownerId, req.body?.details));
        if (existing) {
          await User.findByIdAndUpdate(ownerId, { $addToSet: { Beans: existing._id } });
          return res.status(200).json(existing);
        }
      }
    }
    console.error("Error in createBeans", error);
    res.status(500).json({ message: error.message ?? "Internal Server Issue" });
  }
}
