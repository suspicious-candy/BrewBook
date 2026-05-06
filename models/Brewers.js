import mongoose from "mongoose";

const BrewersSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: String,
  notes: String,
}, { timestamps: true });

export default mongoose.model("Brewers", BrewersSchema);
