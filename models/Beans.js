import mongoose from "mongoose";

const beanSchema = new mongoose.Schema(
      {     
        beanId:{
            type:Number,
            required:true,
            unique: true,
        },
          Name:{
              type: String,
              required : true,
              minlength: 2,
              maxlength: 50,
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
              recipe: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe" },
              Brewer: { type: mongoose.Schema.Types.ObjectId, ref: "Brewer" },
            },
          trackedParameters:{
              type:Map,
              default :{}
          },
          RoastDate:{
            type: Date,
            default: Date.now
          },
          tasteProfile: {
              Roast: {
                  type:String,
                  default:"none",
                  enum:["french","dark","dark-medium","medium","medium-light","light","green"],
              },
              tastingNotes: {
                  type:[String],
                  default:[]
              },
          },
           lastBrew:{
              recipe: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe" },
              Brewer: { type: mongoose.Schema.Types.ObjectId, ref: "Brewer" },
              note:   { type: mongoose.Schema.Types.ObjectId, ref: "Notes" }
            }
      },
      { timestamps: true }
);

const bean = mongoose.model("bean",beanSchema);
export default bean;
