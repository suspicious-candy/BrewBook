import mongoose from "mongoose";

const BeansSchema = new mongoose.Schema({
  name: { type: String, required: true },
  origin: String,
  roastLevel: String,
  notes: String,
}, { timestamps: true });

export default mongoose.model("Beans", BeansSchema);
