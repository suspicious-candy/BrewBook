import mongoose from "mongoose";

const BrewerSchema = new mongoose.Schema(
  {
    BrewerID: {
      type: Number,
      required: true,
      unique: true,
    },
    Name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50,
    },
    preferences: {
      Recipe: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe" },
      bean:   { type: mongoose.Schema.Types.ObjectId, ref: "bean" },
    },
    trackedParameters: { type: Map, default: {} },
    Type: {
      type: String,
      enum: ["immersion", "espresso", "Perculation"],
    },
    filterType: {
      type: String,
      enum: ["paper", "metal", "N/A", "cloth"],
    },
    lastBrew: {
      Note:   { type: mongoose.Schema.Types.ObjectId, ref: "Notes" },
    },
  },
  { timestamps: true }
);

const Brewer = mongoose.model("Brewer", BrewerSchema);
export default Brewer;
