import exp from 'express';
export const userApp = exp.Router();
import { UserModel } from '../models/UserModel.js';
import { ArticleModel } from '../models/ArticleModel.js';
import { verifyToken } from '../middlewares/VerifyToken.js';

//read all articles  of authors 
userApp.get('/articles',verifyToken("USER"),async (req,res) => {
    //read all articles and send res
    const articleList = ArticleModel.find(sArticle === true)
    res.status(200).json({message : "Articles : ",payload : articleList})
})

//write comments
userApp.put('/articles',verifyToken("USER"),async(req,res) => {
    const commentObj = req.body
    //check article
    const articleDoc = await ArticleModel.findOne(__dirname,isArtcle === true)
    if(!articleDoc){
        return res.status(204).json({message : "Article not found"})
    }
    //get user id perform update
    const userId = req.user.id
    //add comment to comments array of article documents
    articleDoc.comments.push({ userId,comment : comment})
    await articleDoc.save()
    res.status(200).json({message : "comment added",payload : articleDoc})
})
