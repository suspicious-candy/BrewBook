import mongoose, { STATES } from "mongoose";

const ArticleSchema = new mongoose.Schema(
       {
          ID:{
            type:Number
          },
          ArticleName:{
              type: String,
              required : true,
              min:2,
              max:50,
            },

            trackedParameters:{
                type:Map,
                default :{}
            },

            ArticleLink:{
                type:String,
            }
        }
);

const News = mongoose.model("News",ArticleSchema);
export default News;
