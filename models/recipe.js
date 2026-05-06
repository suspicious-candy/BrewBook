import mongoose, { STATES } from "mongoose";

const RecipeSchema = new mongoose.Schema(
      {
         ID:{
            type:Number
         },
              Brewer:{
                type:String,
                filterType:{
                    type: String,
                    enum:["paper","metal","N/A","cloth"]
                }
              },
              Bean:{
                type:Number
              },
              CoffeeIn: Number,
              WaterIn: Number,
              WaterTemp:Number,
              BrewTime:Number,
              grindSize: Number,
              bloomTime: Number,
              Agitation:{
                type:String,
                emun:["yes","no"]
              },
              tastingNotes: {
                  type:Array,
                  default:[]
              },
              body:Number,
              acidity:Number,
              bitterness:Number,
              overallRating:Number

      }
);

const Recipe = mongoose.model("Recipe",RecipeSchema);
export default Recipe;
