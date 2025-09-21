const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "User id is mandatory"],
    ref: "users",
  },
  title: {
    type: String,
    required: [true, "Enter post title"],
  },
  description: {
    type: String,
    required: [true, "Enter some content"],
  },
  media: [
    {
      type: {
        type: String,
        enum: ["image", "video"],
      },
      url: {
        type: String,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  likes: [
    {
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    },
  ],
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "User ID is missing"],
        ref: "users",
      },
      comment: {
        type: String,
        required: true,
      },
      commentedAt: {
        type: Date,
        default: Date.now,
      },
      reply: [
        {
          rplyUser: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, "User Id required"],
            ref: "users",
          },
          replyCmnt: {
            type: String,
          },
          repliedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
  ],
  sharedWith: [
    {
      senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
      receiverId: { type: mongoose.Schema.Types.ObjectId, required: true },
      sharedAt: { type: Date, default: Date.now },
      message: {
        type: String,
      },
      postId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
    },
  ],
});

const postModel = mongoose.model("Post", postSchema);

module.exports = postModel;
