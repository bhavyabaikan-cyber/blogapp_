import exp from "express";
import { ArticleModel } from "../models/ArticleModel.js";
import { verifyToken } from "../middlewares/verifyToken.js";

export const userApp = exp.Router();

// Read all active articles
userApp.get("/articles", verifyToken("USER"), async (req, res, next) => {
  try {
    const articleList = await ArticleModel.find({ isArticleActive: true })
      .populate("author", "firstName lastName email profileImageUrl")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Articles : ",
      payload: articleList,
    });
  } catch (err) {
    next(err);
  }
});

// Read single article
userApp.get("/articles/:articleId", verifyToken("USER", "AUTHOR", "ADMIN"), async (req, res, next) => {
  try {
    const { articleId } = req.params;

    const articleDoc = await ArticleModel.findOne({
      _id: articleId,
      isArticleActive: true,
    }).populate("author", "firstName lastName email profileImageUrl");

    if (!articleDoc) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.status(200).json({
      message: "Article found",
      payload: articleDoc,
    });
  } catch (err) {
    next(err);
  }
});

// Write comment
userApp.put("/articles/:articleId/comments", verifyToken("USER"), async (req, res, next) => {
  try {
    const { articleId } = req.params;
    const { comment } = req.body;

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ message: "Comment is required" });
    }

    const articleDoc = await ArticleModel.findOne({
      _id: articleId,
      isArticleActive: true,
    });

    if (!articleDoc) {
      return res.status(404).json({ message: "Article not found" });
    }

    articleDoc.comments.push({
      user: req.user.id,
      comment,
    });

    await articleDoc.save();

    res.status(200).json({
      message: "Comment added",
      payload: articleDoc,
    });
  } catch (err) {
    next(err);
  }
});
