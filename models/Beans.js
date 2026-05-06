import mongoose, { STATES } from "mongoose";

const beanSchema = new mongoose.Schema(
      {
          Name:{
              type: String,
              required : true,
              min:2,
              max:50,
            },
            Origin:{
                Country:{
                type: String,
                default : "none",
                },
                Region:{
                type: String,
                default : "none",
                }
            },
            Varietal:{
                type: String,
                enum:[ "Typica",  "Kona",  "Blue Mountain",  "Maragogype",  "Pacamara",  "Bourbon",  "Catuai",  "Pacas",  "SL-28",  "SL-34",  "Gesha",
                       "Wush Wush",  "Kurume", "Dega", "Catimor", "Castillo", "Ruiri 11"],
            },
            Process:{
              type: String,
              default : "wash",
            },
            ALtitude:{
              type: Number,
              default : 0,
            },
            preferences:{
              preferedBrewers:{
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
          RoastDate:{
            type: "string",
            format: "date",
            default:"none",
          },
          tasteProfile: {
              Roast: {
                  type:String,
                  default:"none",
                  enum:["french","dark","dark-medium","medium","medium-light","light","green"],
              },
              tastingNotes: {
                  type:Array,
                  default:[]
              },
          },
           lastBrew:{
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
      }
);

const bean = mongoose.model("bean",beanSchema);
export default bean;
