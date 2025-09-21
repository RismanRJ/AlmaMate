const { default: mongoose } = require("mongoose");
const conversationModel = require("../models/conversationModel");
const messageModel = require("../models/messageModel");
const { io, getReceiverSocketId, userSocketMap } = require("../socket");
const postModel = require("../models/postModel");

//send a message - almaHub/message/send/:convoId

// socket = io();
module.exports.sendMessage = async (req, res, next) => {
  const { convoId } = req.params;
  console.log("convo id" + convoId);

  const { sender } = req.body;
  const senderId = sender.sender;
  const { receiverId, text } = sender;
  console.log(sender);

  try {
    const convo = await conversationModel.findById(convoId);
    if (!convo) {
      return res.status(404).json({
        status: false,
        message: "chat not found",
      });
    }
    const message = await messageModel.create({
      conversationId: convoId,
      sender: senderId,
      receiver: receiverId,
      text: text,
    });

    // await message.save();
    convo.message.push(message._id);
    await convo.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    console.log("receiverSocker " + receiverSocketId);
    console.log("socketMap " + userSocketMap[receiverId]);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", message);
      console.log("message sent " + message);
    }

    return res.status(201).json({
      status: true,
      response: "Message delivered Successfully",
      convo,
      message,
    });
  } catch (error) {
    console.log(error.message);

    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

module.exports.dummyMessage = async (req, res, next) => {
  const { senderId } = req.params;
  const receiverSocketId = getReceiverSocketId(senderId);
  console.log("receiverSocker " + receiverSocketId);

  if (receiverSocketId) {
    io.to(receiverSocketId).emit("newMessage", "hello !! how are you?");
    // console.log("message sent " + message);
  }
};

//getAll messages - almaHub/messages/getAllMessages
module.exports.getAllMessages = async (req, res, next) => {
  const { userId, targetUserId, conversationId } = req.body;
  console.log(targetUserId, userId);

  try {
    // Fetch messages between the users
    const messages = await messageModel
      .find({
        $or: [
          {
            sender: userId,
            receiver: targetUserId,
            conversationId: conversationId,
          },
          {
            sender: targetUserId,
            receiver: userId,
            conversationId: conversationId,
          },
        ],
      })
      .sort({ sentAt: 1 });

    // Fetch posts shared with the user
    const sharedPosts = await postModel
      .find({ "sharedWith.receiverId": targetUserId })
      .sort({ "sharedWith.sharedAt": 1 });

    console.log(sharedPosts);

    if (messages.length === 0 && sharedPosts.length === 0) {
      return res.status(201).json({
        status: false,
        message: "No messages or shared posts found",
      });
    } else {
      return res.status(201).json({
        status: true,
        message: "Chats and shared posts fetched successfully",
        messages,
        sharedPosts,
      });
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

//update a message - almaHub/messages/update/:messageid
module.exports.updateMessage = async (req, res, next) => {
  const { messageId } = req.params;
  const { text } = req.body;
  try {
    const convo = await conversationModel.find({
      message: {
        $in: messageId,
      },
    });
    const msg = await messageModel.findById(messageId);
    if (!text) {
      return res.status(404).json({
        status: false,
        message: "Field is empty or  not found",
      });
    }
    if (!convo || convo.length == 0) {
      return res.status(404).json({
        status: false,
        message: "chat not found",
      });
    }
    if (!msg) {
      return res.status(404).json({
        status: false,
        message: "Message not found",
      });
    }

    const msgIdx = convo[0].message.indexOf(messageId);
    if (msgIdx == -1) {
      return res.status(404).json({
        status: false,
        message: "Message not found",
      });
    }

    await msg.updateOne({
      text: text,
    });
    await msg.save();

    return res.status(201).json({
      status: true,
      message: "Message updated succesfully",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

//delete a message - almaHub/messages/delete/:messageid
module.exports.deleteMessage = async (req, res, next) => {
  const { messageId } = req.params;
  try {
    const convo = await conversationModel.find({
      message: {
        $in: messageId,
      },
    });
    const msg = await messageModel.findById(messageId);

    if (!convo || convo.length == 0) {
      return res.status(404).json({
        status: false,
        message: "chat not found",
      });
    }
    if (!msg) {
      return res.status(404).json({
        status: false,
        message: "Message not found",
      });
    }

    const msgIdx = convo[0].message.indexOf(messageId);
    if (msgIdx == -1) {
      return res.status(404).json({
        status: false,
        message: "Message not found",
      });
    }

    const dele = await msg.deleteOne({
      _id: messageId,
    });
    convo[0].message.splice(msgIdx, 1);
    await convo[0].save();
    return res.status(201).json({
      status: true,
      message: "Message deleted succesfully",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

//send media - almaHub/messages/send/media
module.exports.sendMedia = async (req, res, next) => {
  const { conversationId, media, text } = req.body;
  try {
    if (!conversationId || !media || media.length === 0) {
      return res.status(400).json({
        status: false,
        message: "Missing required fields",
      });
    }
    const convo = await conversationModel.findById(conversationId);
    if (!convo) {
      return res.status(404).json({
        status: false,
        message: "chat not found",
      });
    }
    const newMsg = await messageModel.create({
      conversationId: conversationId,
      sender: req.user._id,
      media: media,
      text: text,
    });
    convo.message.push(newMsg._id);
    await convo.save();
    return res.status(201).json({
      status: true,
      message: "media delivered to the receipient's successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};
