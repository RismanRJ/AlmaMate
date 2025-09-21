const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

module.exports.assignUserId = async (req, res, next) => {
  const { token } = req.cookies;
  console.log(token);

  if (!token) {
    return res.status(201).json({
      status: false,
      message: "Please login to continue",
    });
  } else {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await userModel.findById(decoded.id);
    next();
  }
};
