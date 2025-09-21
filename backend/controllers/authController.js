const crypto = require("crypto");
const userModel = require("../models/userModel");
const sendToken = require("../utils/jwt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/email");
const postModel = require("../models/postModel");

//register route - almaHub/auth/register
module.exports.registerUser = async (req, res, next) => {
  const { name, email, password } = req.body;
  try {
    const existUser = await userModel.findOne({
      email: email,
    });

    if (existUser) {
      return res.status(404).json({
        status: false,
        message: "user Already Exist.. Please Login to your Account",
      });
    }
    const user = await userModel.create({
      name,
      email,
      password,
      authType: "local",
      role: "student",
    });
    console.log(req.hostname);

    sendToken(user, 201, res);
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "Problem occur during Authentication",
      error: error,
    });
  }
};

//Login route - almaHub/auth/login

module.exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(501).json({
        status: false,
        message: "Please Ensure Email and password correctly",
      });
    }
    const user = await userModel
      .findOne({
        email: email,
      })
      .select("+password");

    console.log(user);

    if (!user) {
      return res.status(201).json({
        status: false,
        message: "User Not Found",
      });
    }

    if (!(await user.isValidPassword(password))) {
      return res.status(201).json({
        status: false,
        message: "Password is Invalid",
      });
    }
    req.user = user;
    sendToken(user, 201, res);
  } catch (error) {
    console.log(error);
    return res.status(501).json({
      status: false,
      message: "Error occur during in Authentication",
    });
  }
};

//logout route - almaHub/auth/logout
module.exports.logoutJWTUser = async (req, res, next) => {
  res
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .status(200)
    .json({
      status: true,
      message: "user loggged out successfully!!",
    });
};

//JWT -check auth state - almaHub/auth/checkAuth
module.exports.checkAuthState = async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(201).json({
      status: false,
      message: "User not logged in",
    });
  } else {
    return res.status(201).json({
      status: true,
      message: "user logged in",
      user: req.user,
    });
  }
};

//JWT - check user already Logged in - almaHub/auth/isLoggedIn
module.exports.isLoggedIn = async (req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    return res.status(404).json({
      status: false,
      message: "user Already Logged In Kindly Sign Out",
    });
  } else {
    next();
  }
};

// JWT - authentication for User login check - almaHub/auth/isAuthenticated
module.exports.isAuthenticatedJWTUser = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(501).json({
      status: false,
      message: "User is Not Authenticated.. Please SignIn to your account",
    });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  req.user = await userModel.findById(decoded.id);
  next();
};

//forgotPassword route- almaHub/auth/password/forgot
module.exports.forgotPassword = async (req, res, next) => {
  const user = await userModel.findOne({
    email: req.body.email,
  });
  if (!user) {
    return res.status(404).json({
      status: false,
      message: "User Not found",
    });
  }
  const resetToken = user.getResetToken();
  await user.save({
    validateBeforeSave: false,
  });
  //reset url
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/almaHub/auth/password/reset/${resetToken}`;
  const message = `Your Password reset url is as follow \n\n
  ${resetURL}\n\n
  If You have not requested this email,then ignore it.`;
  try {
    sendEmail({
      email: user.email,
      subjet: "AlmaHub Password Recovery Email",
      message: message,
    });

    res.status(200).json({
      success: true,
      message: `Email successfully sent to ${user.email}`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpire = undefined;
    await user.save({
      validateBeforeSave: false,
    });
    return res.status(500).json({
      status: false,
      message: error,
    });
  }
};

//forgot password UI page route- almaHub/auth/password/forgot:token
module.exports.sendResetScreen = async (req, res, next) => {
  res.status(201).json({
    status: true,
    message: "UI loaded for reset Page",
  });
};

//reset password route redirected from EMAIl - almaHub/auth/password/reset/:token
module.exports.resetPassword = async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await userModel.findOne({
    resetPasswordToken,
    resetPasswordTokenExpire: {
      $gt: Date.now(),
    },
  });
  if (!user) {
    return res.status(401).json({
      status: false,
      message: "Password token is invalid or expired",
    });
  }
  if (req.body.password !== req.body.confirmPassword) {
    return res.status(401).json({
      status: false,
      message: "Password does not match",
    });
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordTokenExpire = undefined;

  await user.save({
    validateBeforeSave: false,
  });

  sendToken(user, 201, res);
};

//change password[save it in DB] - almaHub/auth/password/change
module.exports.changePassword = async (req, res, next) => {
  const user = await userModel.findById(req.user.id).select("+password");

  // check old password
  if (!(await user.isValidPassword(req.body.oldPassword))) {
    return res.status(401).json({
      status: false,
      message: "Old password is Incorrect",
    });
  }

  // assigning new password
  user.password = req.body.password;
  await user.save();
  res.status(200).json({
    success: true,
  });
};

//----------------------------------------------------------

//google isAuthenticated - almaHub/auth/google/isAuth

module.exports.isAuthenticated = async (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    return res.status(201).json({
      status: false,
      message: "User not authenticated",
    });
  }
};

//google is check auth - auth/google/checkAuth
module.exports.isGoogleAuth = async (req, res, next) => {
  if (req.isAuthenticated()) {
    res.status(201).json({
      status: true,
      message: "User authenticated",
      user: req.user,
    });
    next();
  } else {
    return res.status(201).json({
      status: false,
      message: "User not authenticated",
    });
  }
};

//auth check
module.exports.isGoogleAuthCheck = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(501).json({
      status: false,
      message: "User not authenticated",
    });
  } else {
    next();
  }
};

//google logout - almaHub/auth/google/logout
module.exports.logoutUser = async (req, res, next) => {
  try {
    req.logout((err) => {
      if (err) {
        console.error("Error in req.logout:", err);
        return res.status(501).json({
          status: false,
          message: err.message, // Fix variable name (err, not error)
        });
      }

      req.session.destroy((destroyErr) => {
        if (destroyErr) {
          console.error("Error in session.destroy:", destroyErr);
          return res.status(500).json({
            status: false,
            message: "Failed to destroy session",
          });
        }

        res.clearCookie("connect.sid", {
          path: "/", // Ensure it matches your cookie settings
        });

        // Send a response; choose JSON or redirect, not both
        res.status(200).json({
          status: true,
          message: "User logged out successfully",
        });

        // Uncomment this line if you prefer redirection instead of JSON response
        // res.redirect(process.env.CLIENT_URL);
      });
    });
  } catch (error) {
    console.error("Unexpected error during logout:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

//login success - google route - almaHub/auth/login/google/success
module.exports.loginSucess = async (req, res, next) => {
  sendToken(req.user, 201, res);
  // return res.status(201).json({
  //   status: true,
  //   message: "Login Authentication successful for google signing in ",
  //   user: req.user,
  // });
};

//login failed - google route - almaHub/auth/login/google/failed
module.exports.loginFailed = async (req, res, next) => {
  return res.status(404).json({
    status: false,
    message: "Login Authentication failed for google signing in ",
  });
};

//get profile - almaHub/auth/profile/:id
module.exports.getProfile = async (req, res, next) => {
  const { id } = req.params;

  try {
    const user = await userModel.findById(id);
    const posts = await postModel.find({
      author: id,
    });

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "user not found",
      });
    }
    return res.status(201).json({
      status: true,
      message: "user data fetched",
      user,
      posts,
    });
  } catch (error) {
    return res.status(404).json({
      status: false,
      message: error.message,
    });
  }
};

//update profile - almaHub/auth/profile/:id
module.exports.updateProfile = async (req, res, next) => {
  const { name, avatar, email, role, batch } = req.body;
  const { id } = req.params;
  console.log(role);

  try {
    let user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "user not found",
      });
    }

    await user.updateOne({
      name: name,
      email: email,
      avatar: avatar,
      role: role,
      batch: batch,
    });
    await user.save();
    user = await userModel.findById(id);
    return res.status(201).json({
      status: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    return res.status(404).json({
      status: false,
      message: error.message,
    });
  }
};

//update user role - almaHub/auth/profile/:id
module.exports.updateuserRole = async (req, res, next) => {
  const { role } = req.body;
  const { id } = req.params;
  try {
    let user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "user not found",
      });
    }

    await user.updateOne({
      role: role,
    });
    await user.save();
    user = await userModel.findById(id);
    return res.status(201).json({
      status: true,
      message: "User Role updated successfully",
      user,
    });
  } catch (error) {
    return res.status(404).json({
      status: false,
      message: error.message,
    });
  }
};

//search users - almaHub/auth/search

module.exports.searchUsers = async (req, res, next) => {
  const { name } = req.body;
  try {
    const users = await userModel.find({
      name: { $regex: name, $options: "i" },
    });
    if (!users) {
      return res.status(201).json({
        status: false,
        message: "No user found",
      });
    }
    return res.status(201).json({
      status: true,
      message: "users found succesfully",
      users,
    });
  } catch (error) {
    return res.status(404).json({
      status: false,
      message: error.message,
    });
  }
};

//  get all user from the connections - almaHub/auth/connections/:userId
module.exports.getConnections = async (req, res, next) => {
  const { userId } = req.params; // User ID of the requester

  try {
    let user = await userModel.find();
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    user = user.filter((u) => u._id.toString() !== userId.toString());

    return res.status(200).json({
      status: true,
      message: "Connections fetched successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};
