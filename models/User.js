import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
      {
        UserID:{
            type:Number,
            required:true,
            unique: true,
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
                 Brewer: { type: mongoose.Schema.Types.ObjectId, ref: "Brewer" },
              },
              preferedRecipe:{
                  Recipe: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe" },
              },
              preferedBean:{
                 bean:   { type: mongoose.Schema.Types.ObjectId, ref: "bean" },
              },
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
          LoginData:{
              lastLogin: Date,
              totalBrewsLogged: Number,
              streak: {
                  type:Number,
                  default:0
              },
          }
      },
      { timestamps: true }
);

const user = mongoose.model("user",UserSchema);
export default user;
