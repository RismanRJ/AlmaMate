const mongoose = require("mongoose");
const validator = require("validator");
const bycrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { type } = require("os");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter your name"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true,
    validate: [validator.isEmail, "Please enter Correct email Address"],
  },
  password: {
    type: String,
    maxlength: [15, "password cannot exceed 15 characters"],
    select: false,
  },
  googleId: {
    type: String,
  },
  avatar: {
    type: String,
    required: false,
  },
  role: {
    type: String,
    enum: ["student", "alumni", "admin"],
    select: true,
  },
  batch: {
    type: String,
    required: false,
  },
  authType: {
    type: String,
    enum: ["google", "local"],
    required: [true, "Specify the authentication type"],
  },
  connections: [
    {
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
      receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
      connectedAt: {
        type: Date,
      },
      status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending",
      },
    },
  ],

  resetPasswordToken: String,
  resetPasswordTokenExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bycrypt.hash(this.password, 10);
});

userSchema.methods.getJwtToken = function () {
  return jwt.sign(
    {
      id: this.id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_TIME,
    }
  );
};

userSchema.methods.hello = function () {
  console.log("User hello event called");
};

userSchema.methods.isValidPassword = async function (enteredPassword) {
  return await bycrypt.compare(enteredPassword, this.password);
};
userSchema.methods.getResetToken = function () {
  // Generate token
  const token = crypto.randomBytes(20).toString("hex");

  // Generate Hash and set to resetPasswordToken
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  // Set token expire time
  this.resetPasswordTokenExpire = Date.now() + 30 * 60 * 1000;
  return token;
};

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;
