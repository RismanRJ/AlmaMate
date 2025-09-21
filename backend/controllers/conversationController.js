const { default: mongoose, Mongoose } = require("mongoose");
const conversationModel = require("../models/conversationModel");
const userModel = require("../models/userModel");

//get all users = almaHub/convo/getUsers
module.exports.getUsers = async (req, res, next) => {
  const { id } = req.params;
  // console.log(id);

  try {
    const users = await conversationModel
      .find({
        participants: { $in: [id] },
      })
      .populate("participants", "name email avatar");
    // console.log(users);

    res.status(201).json({
      status: true,
      message: "called ",
      users: users,
    });
  } catch (error) {
    console.log(error.message);

    return res.status(501).json({
      status: false,
      message: error.message,
    });
  }
};

//get all selected particpantsID - almaHub/convo/getAllUserId
module.exports.getAllParticpantId = async (req, res, next) => {
  const { emails } = req.body; //array of user's email
  try {
    if (!emails || !Array.isArray(emails)) {
      return res.status(400).json({
        status: false,
        message: "Invalid email array",
      });
    }
    const users = userModel.find({
      email: {
        $in: emails,
      },
    });
    if (users.length == 0) {
      return res.status(404).json({
        status: false,
        message: "No users found",
      });
    }
    req.particpantId = users;
    next();
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

//create a new chat - almaHub/convo/new
module.exports.createChat = async (req, res, next) => {
  const { userId, participantId } = req.body;
  console.log(userId, participantId);

  try {
    const existingConversation = await conversationModel.findOne({
      participants: { $all: [userId, participantId] },
    });
    if (existingConversation) {
      return res.status(200).json({
        status: true,
        message: "Conversation already exists",
        users: existingConversation.participants,
      });
    }
    const conversation = await conversationModel.create({
      participants: [userId, participantId],
    });
    await conversation.save();
    return res.status(201).json({
      status: true,
      message: "Conversation created successfully",
      users: conversation.participants,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};
("conversation validation failed: participants.1: particpants details is mandatory");

//get all user's chat - almaHub/convo/:userId
module.exports.getUserConversations = async (req, res, next) => {
  const { userId } = req.params;

  try {
    const conversations = await conversationModel
      .find({
        participants: { $in: [userId] },
      })
      .populate("participants", "name email")
      .sort({
        createdAt: -1,
      });
    res.status(200).json({
      status: true,
      message: "user's chat fetched successfully!!",
      conversations,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

//get recipient user id [single] - almaHub/convo/getUserID
module.exports.getParticipantID = async (req, res, next) => {
  const { email } = req.body;
  const { id } = req.params;

  try {
    const currentUser = userModel.findById(id);
    const user = await userModel.findOne({
      email: email,
    });
    if (!currentUser) {
      return res.status(404).json({
        status: false,
        message: "User not found - currentUser",
      });
    }
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found - participant",
      });
    }
    req.user = currentUser;
    req.particpantId = user._id;
    // res.status(201).json({
    //   status: true,
    //   message: "Receipient fetched successfully",
    // });
    console.log("route called");
    next();
  } catch (error) {
    console.log("error occurred");

    return res.status(501).json({
      status: false,
      message: error.message,
    });
  }
};

//get convo id - almaHub/convo/getConvoId
module.exports.getConvoId = async (req, res, next) => {
  const { userId, targetUserId } = req.body;
  try {
    const convo = await conversationModel.findOne({
      participants: {
        $all: [userId, targetUserId],
      },
    });
    console.log(convo);

    if (!convo) {
      return res.status(201).json({
        status: false,
        message: "convo Not found",
      });
    }
    return res.status(201).json({
      status: true,
      message: "conversation Id fetched successfully",
      id: convo._id,
    });
  } catch (error) {
    return res.status(501).json({
      status: false,
      message: error.message,
    });
  }
};
