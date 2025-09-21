const cookieParser = require("cookie-parser");
const express = require("express");
const { app } = require("./socket");
const cors = require("cors");
const auth = require("./routes/auth");
const post = require("./routes/post");
const convo = require("./routes/convo");
const message = require("./routes/message");
const connection = require("./routes/connection");
const dynamicRoutes = require("./routes/dynamicRoutes");
const passport = require("passport");
const dotenv = require("dotenv");
const session = require("express-session");
const path = require("path");
dotenv.config({
  path: path.join(__dirname, "/.env"),
});

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(
  session({
    secret: process.env.SESSION_KEY, // Ensure you have this in your .env file
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: false },
  })
);
app.use("/uploads", express.static("uploads"));
app.use(passport.initialize());
app.use(passport.session());

app.use("/almaHub/", auth);
app.use("/almaHub/", post);
app.use("/almaHub/", convo);
app.use("/almaHub/", message);
app.use("/almaHub/", connection);
app.use("/almaHub/dynamic", dynamicRoutes);

module.exports = app;
