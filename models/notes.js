import mongoose from "mongoose";

const NotesSchema = new mongoose.Schema(
  {
    ID: {
      type: Number,
      required: true,
      unique: true,
    },
    User:{ type: mongoose.Schema.Types.ObjectId, ref: "User" },
    Date: { type: Date, default: Date.now },
    trackedParameters: { type: Map, default: {} },
    Recipe:{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" },
    CoffeeIn:  Number,
    WaterIn:   Number,
    WaterTemp: Number,
    BrewTime:  Number,
    grindSize: Number,
    bloomTime: Number,
    Agitation: {
      type: String,
      enum: ["yes", "no"],
    },
    tastingNotes: { type: [String], default: [] },
    AdditionalNotes: String,
    body:          Number,
    acidity:       Number,
    bitterness:    Number,
    overallRating: Number,
  },
  { timestamps: true }
);

const Notes = mongoose.model("Notes", NotesSchema);
export default Notes;