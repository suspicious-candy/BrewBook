import mongoose from "mongoose";

const RecipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  beans: String,
  brewer: String,
  grindSize: String,
  waterTemp: Number,
  ratio: String,
  steps: [String],
  notes: String,
}, { timestamps: true });

export default mongoose.model("Recipe", RecipeSchema);
