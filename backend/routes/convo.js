const express = require("express");
const {
  createChat,
  getUserConversations,
  getAllParticpantId,
  getParticipantID,
  getUsers,
  getConvoId,
} = require("../controllers/conversationController");
const router = express.Router();

//get All users
router.route("/convo/getUsers/:id").get(getUsers);
//get all particpants ID
router.route("/convo/getAllUserId").post(getAllParticpantId);

//get single Participant ID
router.route("/convo/getUserID").post(getParticipantID);

//create a new convo
router.route("/convo/new").post(createChat);

//get All user's chat convo

router.route("/convo/:userId").get(getUserConversations);

//get convo Id -almaHub/convo/getConvoId
router.route("/convo/getConvoId").post(getConvoId);

module.exports = router;
