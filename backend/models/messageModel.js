const mongoose = require("mongoose");
const postModel = require("./postModel");

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  text: {
    type: String,
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
  post: {
    type: Object,
    ref: postModel,
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
  seen: {
    type: Boolean,
    default: false,
  },
  seenAt: {
    type: Date,
  },
});

module.exports = mongoose.model("Message", messageSchema);
