const express = require("express");
const {
  sendMessage,
  getAllMessages,
  deleteMessage,
  sendMedia,
  updateMessage,
  dummyMessage,
} = require("../controllers/messageController");
const { assignUserId } = require("../middlewares/userIdGet");
const router = express.Router();

//send Message
router.route("/message/send/:convoId").post(sendMessage);

// dummy message
router.route("/message/dummy/:senderId").get(dummyMessage);

//get All messages
router.route("/messages/getAllMessages").post(getAllMessages);

//edit a message
router.route("/messages/update/:messageId").put(updateMessage);

//delete a message
router.route("/messages/delete/:messageId").get(deleteMessage);

//send a media[photo or video]
router.route("/messages/send/media").post(assignUserId, sendMedia);

module.exports = router;
