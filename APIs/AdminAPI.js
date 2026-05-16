import exp from "express";
import { UserModel } from "../models/UserModel.js";
import { ArticleModel } from "../models/ArticleModel.js";
import { verifyToken } from "../middlewares/verifyToken.js";

export const adminApp = exp.Router();

// Dashboard
adminApp.get("/dashboard", verifyToken("ADMIN"), async (req, res, next) => {
  try {
    const totalUsers = await UserModel.countDocuments();
    const activeUsers = await UserModel.countDocuments({ isUserActive: true });
    const totalArticles = await ArticleModel.countDocuments();
    const activeArticles = await ArticleModel.countDocuments({
      isArticleActive: true,
    });

    res.status(200).json({
      message: "Dashboard stats fetched successfully",
      payload: {
        totalUsers,
        activeUsers,
        totalArticles,
        activeArticles,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Get all users
adminApp.get("/users", verifyToken("ADMIN"), async (req, res, next) => {
  try {
    const usersList = await UserModel.find({}, "-password").sort({
      createdAt: -1,
    });

    res.status(200).json({
      message: "Users fetched successfully",
      payload: usersList,
    });
  } catch (err) {
    next(err);
  }
});

// Get single user
adminApp.get("/users/:userId", verifyToken("ADMIN"), async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await UserModel.findById(userId, "-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User fetched successfully",
      payload: user,
    });
  } catch (err) {
    next(err);
  }
});

// Update user
adminApp.put("/users/:userId", verifyToken("ADMIN"), async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role, isUserActive, firstName, lastName } = req.body;

    if (role && !["USER", "AUTHOR", "ADMIN"].includes(role)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    const updateObj = {};

    if (role !== undefined) updateObj.role = role;
    if (isUserActive !== undefined) updateObj.isUserActive = isUserActive;
    if (firstName !== undefined) updateObj.firstName = firstName;
    if (lastName !== undefined) updateObj.lastName = lastName;

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: updateObj },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      payload: updatedUser,
    });
  } catch (err) {
    next(err);
  }
});

// Activate / deactivate user
adminApp.patch("/users/:userId", verifyToken("ADMIN"), async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { isUserActive } = req.body;

    if (typeof isUserActive !== "boolean") {
      return res.status(400).json({
        message: "isUserActive must be true or false",
      });
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: { isUserActive } },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User status updated",
      payload: updatedUser,
    });
  } catch (err) {
    next(err);
  }
});

// Get all articles
adminApp.get("/articles", verifyToken("ADMIN"), async (req, res, next) => {
  try {
    const articlesList = await ArticleModel.find()
      .populate("author", "firstName lastName email profileImageUrl")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Articles fetched successfully",
      payload: articlesList,
    });
  } catch (err) {
    next(err);
  }
});

// Get single article
adminApp.get("/articles/:articleId", verifyToken("ADMIN"), async (req, res, next) => {
  try {
    const { articleId } = req.params;

    const article = await ArticleModel.findById(articleId).populate(
      "author",
      "firstName lastName email profileImageUrl"
    );

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.status(200).json({
      message: "Article fetched successfully",
      payload: article,
    });
  } catch (err) {
    next(err);
  }
});

// Update article
adminApp.put("/articles/:articleId", verifyToken("ADMIN"), async (req, res, next) => {
  try {
    const { articleId } = req.params;
    const { title, category, content, isArticleActive } = req.body;

    const updateObj = {};

    if (title !== undefined) updateObj.title = title;
    if (category !== undefined) updateObj.category = category;
    if (content !== undefined) updateObj.content = content;
    if (isArticleActive !== undefined) updateObj.isArticleActive = isArticleActive;

    const updatedArticle = await ArticleModel.findByIdAndUpdate(
      articleId,
      { $set: updateObj },
      { new: true, runValidators: true }
    ).populate("author", "firstName lastName email profileImageUrl");

    if (!updatedArticle) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.status(200).json({
      message: "Article updated successfully",
      payload: updatedArticle,
    });
  } catch (err) {
    next(err);
  }
});

// Activate / deactivate article
adminApp.patch("/articles/:articleId", verifyToken("ADMIN"), async (req, res, next) => {
  try {
    const { articleId } = req.params;
    const { isArticleActive } = req.body;

    if (typeof isArticleActive !== "boolean") {
      return res.status(400).json({
        message: "isArticleActive must be true or false",
      });
    }

    const updatedArticle = await ArticleModel.findByIdAndUpdate(
      articleId,
      { $set: { isArticleActive } },
      { new: true }
    );

    if (!updatedArticle) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.status(200).json({
      message: "Article status updated",
      payload: updatedArticle,
    });
  } catch (err) {
    next(err);
  }
});

// Delete article permanently
adminApp.delete("/articles/:articleId", verifyToken("ADMIN"), async (req, res, next) => {
  try {
    const { articleId } = req.params;

    const deletedArticle = await ArticleModel.findByIdAndDelete(articleId);

    if (!deletedArticle) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.status(200).json({
      message: "Article permanently deleted",
      payload: deletedArticle,
    });
  } catch (err) {
    next(err);
  }
});

export default adminApp;
