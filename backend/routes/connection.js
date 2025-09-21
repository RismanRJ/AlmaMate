const express = require("express");
const {
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  getAllConnections,
  checkConnectionStatus,
} = require("../controllers/connectionController");
const router = express.Router();

//sending a connection
router.route("/connect").post(sendConnectionRequest);

//check connection status
router.route("/connect/status").post(checkConnectionStatus);

//accepting a connection
router.route("/connect/accept").post(acceptConnectionRequest);

//rejecting a connection
router.route("/connect/reject").post(rejectConnectionRequest);

//get all connections
router.route("/connect/all").post(getAllConnections);

module.exports = router;
