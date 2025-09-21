const { Server } = require("socket.io");
const http = require("http");
const express = require("express");
const { connectDB } = require("./database/config");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({
  path: path.join(__dirname, "/.env"),
});
const app = express();
const server = http.createServer(app);
connectDB();
const io = new Server(server, {
  cors: {
    orgin: [process.env.CLIENT_URL],
    methods: ["GET", "POST"],
  },
});

const userSocketMap = {}; // {userId:socketId}

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;
  // console.log(userSocketMap);

  //io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log(`A user disconnected ${socket.id}`);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

server.listen(process.env.PORT, () => {
  console.log(`Sever running on ${process.env.PORT}`);
});

getReceiverSocketId = (userId) => {
  console.log(userSocketMap);

  return userSocketMap[userId];
};
module.exports = { io, app, server, getReceiverSocketId, userSocketMap };
