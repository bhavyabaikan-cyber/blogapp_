import { Schema,model,Types } from "mongoose";

//create comment schema
const comment = new Schema({
    user : {
        type :Types.ObjectId,
        ref:"user",
        required : [true,"User id required"]
    },
    comment : {
        type : String,
        required : [true,"Enter comment"]
    }},{
        versionKey :false,
        timeseries:true,
        strict : "throw" 
})
const ArticleSchema = new Schema({
      author  : {
        type : Types.ObjectId,
        ref: "user",
        requires : [true,"Author id is required"]
      },
      title :{
        type : String,
        required :[true,"is required"],
      },
      category : {
            
      },
      content : {
        type : String,
        required : [true,"content is required"]
      },
      comments : {
           type : []
      },
      isArticle : {
          type : Boolean,
          default : true
      },
    },{
      
})

export const ArticleModel = model("article",ArticleSchema)