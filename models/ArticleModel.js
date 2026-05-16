import { Schema, model, Types } from "mongoose";

const commentSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "user",
      required: [true, "User id required"],
    },
    comment: {
      type: String,
      required: [true, "Enter comment"],
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const ArticleSchema = new Schema(
  {
    author: {
      type: Types.ObjectId,
      ref: "user",
      required: [true, "Author id is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
    },
    comments: {
      type: [commentSchema],
      default: [],
    },
    isArticleActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: "throw",
  }
);

export const ArticleModel = model("article", ArticleSchema);
