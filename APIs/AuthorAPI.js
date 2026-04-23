import  exp from 'express'
import {UserModel} from '../models/UserModel.js'
import {ArticleModel} from '../models/ArticleModel.js'
import {verifyToken} from "../middlewares/verifyToken.js"
export const authorApp = exp.Router()

//Write article
authorApp.post("/article",verifyToken("AUTHOR"),async(req,res)=>{
    //get articleObj from client
    const articleObj=req.body
    //get user from decoded token
    let user=req.user
    //check author
    let author=await UserModel.findById(articleObj.author)
    //checking author email and decoded email are same or not
    if(author.email!==user.email){
        return res.status(403).json({message:"You are not authorised"})
    }
    if(!author){
        return res.status(404).json({message:"Invalid author"})
    }

    //create article document
    const articleDoc=new ArticleModel(articleObj)
    //save
    await articleDoc.save()
    //send res
    res.status(201).json({message:"Article published successfully!"})
})

//Read own articles
authorApp.get("/articles",verifyToken("AUTHOR"),async(req,res)=>{
    //get author id from decoded token
    const authorIdOfToken=req.user?.id
    const articlesList=await ArticleModel.find({author:authorIdOfToken})
    //send res
    res.status(200).json({ message: "Articles: ", payload: articlesList })
})

//Edit articles
authorApp.put("/article",verifyToken("AUTHOR"),async(req,res)=>{
    //get author id from decoded token
    const authorIdOfToken=req.user?.id
    //get modified article from client
    const {articleId,title,category,content}=req.body  
    const modifiedArticle=await ArticleModel.findOneAndUpdate(
        {_id:articleId,author:authorIdOfToken},
        {$set:{title,category,content}},
        {new:true}
    )
    if(!modifiedArticle){
        return res.status(403).json({message:"Not authorised to edit the article"})
    }
    //send res
    res.status(200).json({message:"Article modified successfully",payload:modifiedArticle})
})
//Delete articles
