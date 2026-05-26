import mongoose from "mongoose";

const beanSchema = new mongoose.Schema(
  {
    beanId: {
      type: Number,
      required: true,
      unique: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    details: {
      Name: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 50,
      },
      Origin: {
        Country: { type: String, required: true, default: "none" },
        Region: { type: String, required: true, default: "none" },
      },
      Varietal: {
        type: String,
        required: true,
        enum: [
          "Typica", "Kona", "Blue Mountain", "Maragogype", "Pacamara",
          "Bourbon", "Catuai", "Pacas", "SL-28", "SL-34", "Gesha",
          "Wush Wush", "Kurume", "Dega", "Catimor", "Castillo", "Ruiri 11",
        ],
      },
      Process: {
        type: String,
        required: true,
        default: "wash",
      },
      Altitude: {
        type: Number,
        required: true,
        default: 0,
      },
      RoastDate: {
        type: Date,
        required: true,
      },
      tasteProfile: {
        Roast: {
          type: String,
          required: true,
          default: "none",
          enum: ["french", "dark", "dark-medium", "medium", "medium-light", "light", "green"],
        },
        tastingNotes: {
          type: [String],
          default: [],
        },
      },
    },
    Quantity: {
      type: Number,
    },
    preferences: {
      recipe: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe" },
      Brewer: { type: mongoose.Schema.Types.ObjectId, ref: "Brewer" },
    },
    trackedParameters: {
      type: Map,
      default: {},
    },
    lastBrew: {
      note: { type: mongoose.Schema.Types.ObjectId, ref: "Notes" },
    },
  },
  { timestamps: true }
);

beanSchema.index(
  {
    owner: 1,
    "details.Name": 1,
    "details.Origin.Country": 1,
    "details.Origin.Region": 1,
    "details.Varietal": 1,
    "details.Process": 1,
    "details.RoastDate": 1,
  },
  { unique: true, name: "bean_owner_identity" }
);

const bean = mongoose.model("bean", beanSchema);
export default bean;
