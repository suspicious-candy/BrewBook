import mongoose, { STATES } from "mongoose";

const NotesSchema = new mongoose.Schema(
      {
         ID:{
            type:Number
         },
          trackedParameters:{
              type:Map,
              default :{}
          },
              Brewer:{
                type:String,
                filterType:{
                    type: String,
                    enum:["paper","metal","N/A","cloth"]
                }
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

const Notes = mongoose.model("Notes",NotesSchema);
export default Notes;
