import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
      {
        UserID:{
            type:Number,
        },
          firstName:{
              type: String,
              required : true,
              min:2,
              max:30,
          },
          lastName:{
              type: String,
              required : true,
              min:2,
              max:30,
          },
          email:{
              type: String,
              required : true,
              max:50,
              unique : true,
          },
          password:{
              type: String,
              required : true,
              max:50,
              min: 10,
          },
          Brewers:{
              type: Array,
              default :[],
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
          userLevel: {
              type: String,
              enum: ["Bean Sprout ", "Barista", "BrewMaster"],
              default: "Bean Sprout "
          },
          tasteProfile: {
              preferredStrength: {
                  type:String,
                  default:"none"
              },
              preferredBitterness: {
                  type:String,
                  default:"none"
              },
              preferredAcidity:{
                  type:String,
                  default:"none"
              },
              preferredBody: {
                  type:String,
                  default:"none"
              },
          },
          LoginData:{
              lastLogin: Date,
              totalBrewsLogged: Number,
              streak: {
                  type:Number,
                  default:0
              },
          }
      }
);

const user = mongoose.model("user",UserSchema);
export default user;
