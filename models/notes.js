import mongoose from "mongoose";

const NotesSchema = new mongoose.Schema(
  {
    ID: {
      type: Number,
      required: true,
      unique: true,
    },
    Date: { type: Date, default: Date.now },
    trackedParameters: { type: Map, default: {} },
    Brewer: { type: mongoose.Schema.Types.ObjectId, ref: "Brewer" },
    bean:   { type: mongoose.Schema.Types.ObjectId, ref: "bean" },
    tastingNotes: { type: [String], default: [] },
    body: Number,
    acidity: Number,
    bitterness: Number,
    overallRating: Number,
  },
  { timestamps: true }
);

const Notes = mongoose.model("Notes", NotesSchema);
export default Notes;
