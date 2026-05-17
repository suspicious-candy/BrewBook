import mongoose from "mongoose";

const ArticleSchema = new mongoose.Schema(
       {
          ID:{
            type:Number,
            required:true,
            unique: true,
          },
          ArticleName:{
              type: String,
              required : true,
              minlength:2,
              maxlength:50,
            },
            Author:{
              type: String,
              minlength:2,
              maxlength:50
            },

            trackedParameters:{
                type:Map,
                default :{}
            },

            ArticleLink:{
                type:String,
            },
            ArticleBody:{
                type:String,
            }
        },
      { timestamps: true }
        
);

const News = mongoose.model("News",ArticleSchema);
export default News;
