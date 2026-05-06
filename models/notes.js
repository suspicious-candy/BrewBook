import mongoose from "mongoose";

const NotesSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: String,
  tags: [String],
}, { timestamps: true });

export default mongoose.model("Notes", NotesSchema);
