import mongoose from "mongoose";

const RecipeSchema = new mongoose.Schema(
  {
    ID: {
      type: Number,
      required: true,
      unique: true,
    },
    Brewer: { type: mongoose.Schema.Types.ObjectId, ref: "Brewer" },
    bean:   { type: mongoose.Schema.Types.ObjectId, ref: "bean" },
    RecipeBody: String,
    CoffeeIn: Number,
    WaterIn: Number,
    WaterTemp: Number,
    BrewTime: Number,
    grindSize: Number,
    bloomTime: Number,
    Agitation: {
      type: String,
      enum: ["yes", "no"],
    },
    overallRating: Number,
  },
  { timestamps: true }
);

const Recipe = mongoose.model("Recipe", RecipeSchema);
export default Recipe;
