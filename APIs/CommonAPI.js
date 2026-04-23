import exp from "express";
import { UserModel } from "../models/UserModel.js";
import { hash, compare } from "bcryptjs";
import { config } from "dotenv";
import jwt from "jsonwebtoken";
import { verifyToken } from "../middlewares/VerifyToken.js";

const { sign } = jwt;
export const commonApp = exp.Router();

import { upload } from "../config/multer.js";
import { uploadToCloudinary } from "../config/cloudinaryUpload.js";
import cloudinary from "../config/cloudinary.js";

config();

commonApp.post("/users", upload.single("profileImageUrl"), async (req, res, next) => {
  let cloudinaryResult;
  try {
    let allowedRoles = ["USER", "AUTHOR"];
    const newUser = req.body;
    
    // Validate role
    if (!allowedRoles.includes(newUser.role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    
    // Upload image to Cloudinary if present
    if (req.file) {
      cloudinaryResult = await uploadToCloudinary(req.file.buffer);
      newUser.profileImageUrl = cloudinaryResult?.secure_url;
    }
    
    // Hash password
    newUser.password = await hash(newUser.password, 12);
    
    // Create and save user (FIXED: UserModel with capital U)
    const newUserDoc = new UserModel(newUser);
    await newUserDoc.save();
    
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.log("Error in registration:", err);
    // Cleanup: delete image from Cloudinary if upload succeeded but save failed
    if (cloudinaryResult?.public_id) {
      await cloudinary.uploader.destroy(cloudinaryResult.public_id);
    }
    next(err);
  }
});


commonApp.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }
    
    // Compare password
    const isMatched = await compare(password, user.password);
    if (!isMatched) {
      return res.status(400).json({ message: "Invalid password" });
    }
    
    // Create JWT token
    const signedToken = sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
      },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );
    
    // Set token as httpOnly cookie
    res.cookie("token", signedToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });
    
    // Remove password from response
    let userObj = user.toObject();
    delete userObj.password;
    
    res.status(200).json({ message: "Login successful", payload: userObj });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

commonApp.get("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });
  res.status(200).json({ message: "Logout successful" });
});


commonApp.get("/check-auth", verifyToken("USER", "AUTHOR", "ADMIN"), (req, res) => {
  res.status(200).json({
    message: "Authenticated",
    payload: req.user,
  });
});


commonApp.put("/password", verifyToken("USER", "AUTHOR", "ADMIN"), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }
    
    // Find user
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Verify current password
    const isMatched = await compare(currentPassword, user.password);
    if (!isMatched) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }
    
    // Check if new password is same as current
    const isSame = await compare(newPassword, user.password);
    if (isSame) {
      return res.status(400).json({ message: "New password cannot be the same as current password" });
    }
    
    // Hash and update password
    const hashedNewPassword = await hash(newPassword, 12);
    user.password = hashedNewPassword;
    await user.save();
    
    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error changing password", error: err.message });
  }
});
