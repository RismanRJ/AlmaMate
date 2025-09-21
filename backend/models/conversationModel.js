const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      // required: [true, "particpants details is mandatory"],
      ref: "users",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  message: [
    {
      type: String,
    },
    {
      messageId: {
        type: mongoose.Schema.Types.ObjectId,
      },
    },
  ],
});

const conversationModel = mongoose.model("conversation", conversationSchema);

module.exports = conversationModel;
