module.exports.checkAuth = async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(404).json({
      status: false,
      message: "Please login to continue",
    });
  } else {
    next();
  }
};
