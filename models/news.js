import mongoose from "mongoose";

const NewsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: String,
  source: String,
}, { timestamps: true });

export default mongoose.model("News", NewsSchema);
