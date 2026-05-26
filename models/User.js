import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
      {
        // Legacy numeric ID for the /oauth and /users/:id flows.
        // Supabase-created users don't have one; sparse keeps the unique index
        // from rejecting multiple null values.
        UserID:{
            type:Number,
            unique: true,
            sparse: true,
        },
          firstName:{
              type: String,
              required : true,
              minlength:2,
              maxlength:30,
          },
          lastName:{
              type: String,
              required : true,
              minlength:2,
              maxlength:30,
          },
          email:{
              type: String,
              required : true,
              maxlength:50,
              unique : true,
          },
          // Only used by the legacy /oauth HTML login flow.
          // Supabase handles auth for the mobile app, so this is optional.
          password:{
              type: String,
          },
          Brewers:{
               type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Brewer" }],
              default :[],
          },
          preferences:{
              preferedBrewers:{ 
                 type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Brewer" }],
              },
              preferedRecipe:{
                 type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],
              },
              preferedBean:{
                 type:[{ type: mongoose.Schema.Types.ObjectId, ref: "bean" }],
              },
          },
          userLevel: {
              type: String,
              enum: ["Bean Sprout", "Barista", "BrewMaster"],
              default: "Bean Sprout"
          },
          Beans: {
            type: [{ type: mongoose.Schema.Types.ObjectId, ref: "bean" }],
            default: [],
          },
          LoginData:{
              lastLogin: Date,
              totalBrewsLogged: Number,
              streak: {
                  type:Number,
                  default:0
              },
          },
          LastBrew:{
              type: mongoose.Schema.Types.ObjectId,
              ref: "Notes"
          }
      },
      { timestamps: true }
);

const user = mongoose.model("user",UserSchema);
export default user;
