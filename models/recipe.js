import mongoose from "mongoose";

const PourSchema = new mongoose.Schema(
  {
    at:    { type: Number, required: true },
    to:    { type: Number, required: true },
    note:  String,
    type:  { type: String, enum: ['bloom', 'pour', 'wait', 'swirl', 'drawdown', 'plunge'] },
    label: String,
  },
  { _id: false }   // <-- this is the right place
);

const RecipeSchema = new mongoose.Schema(
  {
    ID:     { type: Number, required: true, unique: true },
    Name:   { type: String, required: true, minlength: 2, maxlength: 80 },
    Brewer: { type: mongoose.Schema.Types.ObjectId, ref: "Brewer" },
    bean:   { type: mongoose.Schema.Types.ObjectId, ref: "bean" },

    pours: { type: [PourSchema], default: [] },

    RecipeBody: String,
    CoffeeIn:  { type: Number, min: 0 },
    WaterIn:   { type: Number, min: 0 },
    WaterTemp: { type: Number, min: 0, max: 100 },
    BrewTime:  { type: Number, min: 0 },
    grindSize: { type: Number, min: 0 },
    bloomTime: { type: Number, min: 0 },
    Agitation: { type: String, enum: ["yes", "no"] },
    overallRating: { type: Number, min: 0, max: 10 },
  },
  { timestamps: true }
);

// Optional but recommended: enforce that the last pour matches WaterIn
RecipeSchema.pre('save', function (next) {
  if (this.pours?.length && this.WaterIn != null) {
    const last = this.pours[this.pours.length - 1];
    if (Math.abs(last.to - this.WaterIn) > 1) {
      return next(new Error(`Last pour (${last.to}g) must equal WaterIn (${this.WaterIn}g)`));
    }
  }
  next();
});

const Recipe = mongoose.model("Recipe", RecipeSchema);
export default Recipe;