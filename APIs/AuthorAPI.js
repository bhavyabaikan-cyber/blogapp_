import exp from "express";
import { UserModel } from "../models/UserModel.js";
import { ArticleModel } from "../models/ArticleModel.js";
import { verifyToken } from "../middlewares/verifyToken.js";

export const authorApp = exp.Router();

// Write article
authorApp.post("/article", verifyToken("AUTHOR"), async (req, res, next) => {
  try {
    const articleObj = req.body;
    const user = req.user;

    const author = await UserModel.findById(articleObj.author);
    
    if (!author) {
      return res.status(404).json({ message: "Invalid author" });
    }

    if (author.email !== user.email) {
      return res.status(403).json({ message: "You are not authorised" });
    }

    const articleDoc = new ArticleModel(articleObj);
    await articleDoc.save();

    res.status(201).json({
      message: "Article published successfully!",
      payload: articleDoc,
    });
  } catch (err) {
    next(err);
  }
});

// Read own articles
authorApp.get("/articles", verifyToken("AUTHOR"), async (req, res, next) => {
  try {
    const authorIdOfToken = req.user?.id;

    const articlesList = await ArticleModel.find({
      author: authorIdOfToken,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Articles: ",
      payload: articlesList,
    });
  } catch (err) {
    next(err);
  }
});

// Edit article
authorApp.put("/article", verifyToken("AUTHOR"), async (req, res, next) => {
  try {
    const authorIdOfToken = req.user?.id;
    const { articleId, title, category, content } = req.body;

    const modifiedArticle = await ArticleModel.findOneAndUpdate(
      { _id: articleId, author: authorIdOfToken },
      { $set: { title, category, content } },
      { new: true, runValidators: true }
    );

    if (!modifiedArticle) {
      return res.status(403).json({
        message: "Not authorised to edit the article",
      });
    }

    res.status(200).json({
      message: "Article modified successfully",
      payload: modifiedArticle,
    });
  } catch (err) {
    next(err);
  }
});

// Soft delete article
authorApp.patch("/article/:articleId", verifyToken("AUTHOR"), async (req, res, next) => {
  try {
    const authorIdOfToken = req.user?.id;
    const { articleId } = req.params;

    const deletedArticle = await ArticleModel.findOneAndUpdate(
      { _id: articleId, author: authorIdOfToken },
      { $set: { isArticleActive: false } },
      { new: true }
    );

    if (!deletedArticle) {
      return res.status(403).json({
        message: "Not authorised to delete the article",
      });
    }

    res.status(200).json({
      message: "Article deleted successfully",
      payload: deletedArticle,
    });
  } catch (err) {
    next(err);
  }
});
