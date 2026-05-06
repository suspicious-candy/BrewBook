import mongoose, { STATES } from "mongoose";

const BrewerSchema = new mongoose.Schema(
      {
        BrewerID:{
            type:Number,
        },
          Name:{
              type: String,
              required : true,
              min:2,
              max:50,
            },
            preferences:{
              preferedBean:{
                  type:String,
              },
              preferedRatio:{
                  type:Number,
                  default:0
              },
              preferedGrindSize:{
                  type:String,
                  default:"none"
              },
              preferedBrewTemp:{
                  type:Number,
                  default:100
              }
          },

          trackedParameters:{
              type:Map,
              default :{}
          },

          filterType:{
                type: String,
                enum:["paper","metal","N/A","cloth"]
            },

           lastBrew:{
              NoteID:Number,
              RecipeID:Number
            }
      }
);

const Brewer = mongoose.model("Brewer",BrewerSchema);
export default Brewer;
