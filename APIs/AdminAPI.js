import exp from "express";
import { UserModel } from "../models/UserModel.js";
import { ArticleModel } from "../models/ArticleModel.js";
import { verifyToken } from "../middlewares/VerifyToken.js";

export const adminApp = exp.Router();

// Get dashboard statistics
adminApp.get("/dashboard", verifyToken("ADMIN"), async (req, res) => {
  try {
    const totalUsers = await UserModel.countDocuments();
    const activeUsers = await UserModel.countDocuments({ isUserActive: true });
    const totalArticles = await ArticleModel.countDocuments();
    const activeArticles = await ArticleModel.countDocuments({ isArticleActive: true });
    
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
    res.status(500).json({ message: "Error fetching dashboard stats", error: err.message });
  }
});


// Get all users
adminApp.get("/users", verifyToken("ADMIN"), async (req, res) => {
  try {
    const usersList = await UserModel.find({}, "-password"); // Exclude password field
    res.status(200).json({ message: "Users fetched successfully", payload: usersList });
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
});

// Get single user by ID
adminApp.get("/users/:userId", verifyToken("ADMIN"), async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await UserModel.findById(userId, "-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({ message: "User fetched successfully", payload: user });
  } catch (err) {
    res.status(500).json({ message: "Error fetching user", error: err.message });
  }
});

// Update user role or status
adminApp.put("/users/:userId", verifyToken("ADMIN"), async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, isUserActive, firstName, lastName } = req.body;
    
    // Validate role if provided
    if (role && !["USER", "AUTHOR", "ADMIN"].includes(role)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }
    
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: userId },
      { $set: { role, isUserActive, firstName, lastName } },
      { new: true, runValidators: true },
    ).select("-password");
    
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({ message: "User updated successfully", payload: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Error updating user", error: err.message });
  }
});

// Soft delete user (deactivate)
adminApp.patch("/users/:userId", verifyToken("ADMIN"), async (req, res) => {
  try {
    const { userId } = req.params;
    const { isUserActive } = req.body;
    
    const user = await UserModel.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Check if status is already same
    if (isUserActive === user.isUserActive) {
      return res.status(200).json({ message: "User already in the same state" });
    }
    
    user.isUserActive = isUserActive;
    await user.save();
    
    res.status(200).json({ message: "User status updated", payload: user });
  } catch (err) {
    res.status(500).json({ message: "Error updating user status", error: err.message });
  }
});

// Get all articles (with optional author details)
adminApp.get("/articles", verifyToken("ADMIN"), async (req, res) => {
  try {
    const articlesList = await ArticleModel.find()
      .populate("author", "firstName lastName email")
      .sort({ createdAt: -1 });
      
    res.status(200).json({ message: "Articles fetched successfully", payload: articlesList });
  } catch (err) {
    res.status(500).json({ message: "Error fetching articles", error: err.message });
  }
});

// Get single article by ID
adminApp.get("/articles/:articleId", verifyToken("ADMIN"), async (req, res) => {
  try {
    const { articleId } = req.params;
    const article = await ArticleModel.findById(articleId)
      .populate("author", "firstName lastName email");
    
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }
    
    res.status(200).json({ message: "Article fetched successfully", payload: article });
  } catch (err) {
    res.status(500).json({ message: "Error fetching article", error: err.message });
  }
});

// Update article (admin can edit any article)
adminApp.put("/articles/:articleId", verifyToken("ADMIN"), async (req, res) => {
  try {
    const { articleId } = req.params;
    const { title, category, content, isArticleActive } = req.body;
    
    const updatedArticle = await ArticleModel.findOneAndUpdate(
      { _id: articleId },
      { $set: { title, category, content, isArticleActive } },
      { new: true, runValidators: true },
    ).populate("author", "firstName lastName email");
    
    if (!updatedArticle) {
      return res.status(404).json({ message: "Article not found" });
    }
    
    res.status(200).json({ message: "Article updated successfully", payload: updatedArticle });
  } catch (err) {
    res.status(500).json({ message: "Error updating article", error: err.message });
  }
});

// Soft delete article (toggle active status)
adminApp.patch("/articles/:articleId", verifyToken("ADMIN"), async (req, res) => {
  try {
    const { articleId } = req.params;
    const { isArticleActive } = req.body;
    
    const article = await ArticleModel.findById(articleId);
    
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }
    
    // Check if status is already same
    if (isArticleActive === article.isArticleActive) {
      return res.status(200).json({ message: "Article already in the same state" });
    }
    
    article.isArticleActive = isArticleActive;
    await article.save();
    
    res.status(200).json({ message: "Article status updated", payload: article });
  } catch (err) {
    res.status(500).json({ message: "Error updating article status", error: err.message });
  }
});

// Delete article permanently (hard delete - use with caution)
adminApp.delete("/articles/:articleId", verifyToken("ADMIN"), async (req, res) => {
  try {
    const { articleId } = req.params;
    
    const deletedArticle = await ArticleModel.findByIdAndDelete(articleId);
    
    if (!deletedArticle) {
      return res.status(404).json({ message: "Article not found" });
    }
    
    res.status(200).json({ message: "Article permanently deleted", payload: deletedArticle });
  } catch (err) {
    res.status(500).json({ message: "Error deleting article", error: err.message });
  }
});

// ==================== SEARCH & FILTER ====================
// Search users by name or email
adminApp.get("/search/users", verifyToken("ADMIN"), async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }
    
    const users = await UserModel.find({
      $or: [
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    }, "-password");
    
    res.status(200).json({ message: "Search results", payload: users });
  } catch (err) {
    res.status(500).json({ message: "Error searching users", error: err.message });
  }
});

// Search articles by title, category or content
adminApp.get("/search/articles", verifyToken("ADMIN"), async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }
    
    const articles = await ArticleModel.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
      ],
    })
    .populate("author", "firstName lastName email")
    .sort({ createdAt: -1 });
    
    res.status(200).json({ message: "Search results", payload: articles });
  } catch (err) {
    res.status(500).json({ message: "Error searching articles", error: err.message });
  }
});