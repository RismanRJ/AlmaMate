const sendToken = (user, statuscode, res) => {
  //Creating jwt token
  const token = user.getJwtToken();

  // setting cookies
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  res.status(statuscode).cookie("token", token, options).json({
    status: true,
    message: "Account Logged in successfully",
    token,
    user,
  });
};

module.exports = sendToken;
