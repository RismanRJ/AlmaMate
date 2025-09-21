const express = require("express");
const {
  registerUser,
  checkInuser,
  loginUser,
  loginGoogleUser,
  callbackGoogleUser,
  loginFailed,
  loginSucess,
  isAuthenticated,
  logoutUser,
  logoutJWTUser,
  isAuthenticatedJWTUser,
  forgotPassword,
  resetPassword,
  changePassword,
  isLoggedIn,
  sendResetScreen,
  getProfile,
  updateProfile,
  checkAuthState,
  isGoogleAuth,
  searchUsers,
  isGoogleAuthCheck,
  getConnections,
  updateuserRole,
} = require("../controllers/authController");

const passport = require("passport");
const { checkAuth } = require("../middlewares/checkAuth");
const { assignUserId } = require("../middlewares/userIdGet");
const router = express.Router();
require("../database/passport");

//jwt routes
router.route("/auth/checkAuthState").get(assignUserId, checkAuthState);
router.route("/auth/register").post(isLoggedIn, registerUser);
router.route("/auth/login").post(isLoggedIn, loginUser);
router.route("/auth/logout").get(logoutJWTUser);
router
  .route("/auth/password/forgot")
  .post(isAuthenticatedJWTUser, forgotPassword);
router
  .route("/auth/password/reset/:token")
  .get(sendResetScreen)
  .post(resetPassword);
router.route("/password/change").put(isAuthenticatedJWTUser, changePassword);

//-------------------------------------------------------------------

//login Google route - "almaHub/auth/login/google"

router.get(
  "/auth/login/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

//callback google route - "almaHub/auth/google/callback"

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth/login/google/failed",
    successRedirect: process.env.CLIENT_URL,
  }),
  (req, res) => {
    console.log("callback received");

    res.status(200).json({
      status: true,
      message: "Google sign-in successful",
      user: req.user,
    });
  }
);

router.route("/auth/login/google/success").get(isAuthenticated, loginSucess);
router.route("/auth/login/google/failed").get(loginFailed);
router.route("/auth/google/checkAuth").get(isGoogleAuth);
router.route("/auth/google/isAuth").get(isAuthenticated);
router.route("/auth/google/logout").get(logoutUser);

//profile route
//get profile - almaHub/auth/profile/:id
router.route("/auth/profile/:id").get(getProfile);

//update profile - //get profile - almaHub/auth/profile/:id
router.route("/auth/profile/:id").put(checkAuth, updateProfile);
router.route("/auth/profile/:id").put(updateuserRole);

//search user
router.route("/auth/search").post(checkAuth, searchUsers);
router.route("/auth/google/search").post(isGoogleAuthCheck, searchUsers);

// get connections - almaHub/auth/connections/:userId
router.route("/auth/connections/:userId").get(getConnections);
module.exports = router;
