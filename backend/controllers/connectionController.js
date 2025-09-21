const express = require("express");
const userModel = require("../models/userModel");

//send a connection request - almaHub/connect
module.exports.sendConnectionRequest = async (req, res, next) => {
  const { userId, targetUserId } = req.body;
  try {
    const targetUser = await userModel.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }
    const existingOne = await userModel.findOne({
      _id: userId,
      "connections.receiverId": targetUserId,
    });
    if (existingOne) {
      return res.status(400).json({
        status: false,
        message: "Connection already exists",
      });
    }

    await userModel.findByIdAndUpdate(userId, {
      $push: {
        connections: {
          receiverId: targetUserId,
          senderId: userId,
          status: "pending",
        },
      },
    });

    await userModel.findByIdAndUpdate(targetUserId, {
      $push: {
        connections: {
          receiverId: targetUserId,
          senderId: userId,
          status: "pending",
        },
      },
    });

    return res.status(200).json({
      status: true,
      message: "Connection request sent",
      connectionStatus: "pending",
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

//accept a connection request - almaHub/connect/accept
module.exports.acceptConnectionRequest = async (req, res, next) => {
  const { userId, targetUserId } = req.body;
  try {
    const targetUser = await userModel.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }
    const existingOne = await userModel.findOne({
      _id: userId,
      "connections.senderId": targetUserId,
    });
    if (!existingOne) {
      return res.status(201).json({
        status: false,
        message: "Connection not found or already accepted",
      });
    }

    await userModel.updateOne(
      {
        _id: userId,
        "connections.senderId": targetUserId,
        "connections.receiverId": userId,
      },
      {
        $set: {
          "connections.$.status": "accepted",
          "connections.$.connectedAt": Date.now(),
        },
      }
    );
    await userModel.updateOne(
      {
        _id: targetUserId,
        "connections.senderId": targetUserId,
        "connections.receiverId": userId,
      },
      {
        $set: {
          "connections.$.status": "accepted",
          "connections.$.connectedAt": Date.now(),
        },
      }
    );
    return res.status(200).json({
      status: true,
      message: "Connection request accepted",
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

//reject a connection request - almaHub/connect/reject
module.exports.rejectConnectionRequest = async (req, res, next) => {
  const { userId, targetUserId } = req.body;
  try {
    const targetUser = await userModel.findById(targetUserId);
    const currentUser = await userModel.findById(userId);
    if (!targetUser) {
      return res.status(201).json({
        status: false,
        message: "User not found",
      });
    }

    const existingOne = await userModel.findOne({
      _id: userId,
      "connections.receiverId": targetUserId,
    });
    if (!existingOne) {
      return res.status(400).json({
        status: false,
        message: "Connection not found or already rejected",
      });
    }
    await userModel.updateOne(
      {
        _id: targetUserId,
        "connections.senderId": userId,
        "connections.receiverId": targetUserId,
      },
      {
        $set: {
          "connections.$.status": "rejected",
          "connections.$.connectedAt": Date.now(),
        },
      }
    );

    currentUser.connections.splice(
      currentUser.connections.findIndex((conn) => conn.receiverId == userId),
      1
    );
    await currentUser.save();

    return res.status(200).json({
      status: true,
      message: "Connection request rejected",
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

//get all connections - almaHub/connect/all
module.exports.getAllConnections = async (req, res, next) => {
  const { userId } = req.body;
  try {
    const user = await userModel
      .findById(userId)
      .populate("connections.receiverId", "name email");
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      status: true,
      connections: user.connections,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

//check connection status - almaHub/connect/status

module.exports.checkConnectionStatus = async (req, res, next) => {
  const { userId, targetUserId } = req.body;
  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    const connection = user.connections.filter(
      (conn) =>
        (conn.senderId == userId || conn.receiverId == userId) &&
        (conn.senderId == targetUserId || conn.receiverId == targetUserId)
    );

    if (!connection || connection.length == 0) {
      return res.status(201).json({
        status: false,
        message: "Connection not found",
      });
    }
    // console.log(connection);
    return res.status(200).json({
      status: true,
      connectionStatus: connection[0].status,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};
