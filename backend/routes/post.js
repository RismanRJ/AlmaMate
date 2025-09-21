const express = require("express");
const {
  createNewPost,
  likePost,
  commentPost,
  updateComment,
  deleteComment,
  sharePost,
  getPost,
  deleteReplyComment,
  replyComment,
  unlikePost,
  getAllPosts,
} = require("../controllers/postContoller");
const { assignUserId } = require("../middlewares/userIdGet");
const { upload } = require("../utils/multer");
const router = express.Router();

//create a new Post
router.route("/posts/create").post(assignUserId, createNewPost);

// almaHub/posts/getAll?pageNumber=&&limit=10
router.route("/posts/getAll").get(getAllPosts);

router.route("/posts/:postid/get").get(getPost);

//like a post
router.route("/posts/:id/like").get(assignUserId, likePost);

//unlike a post
router.route("/posts/:id/unlike").get(assignUserId, unlikePost);

//comment a post
router.route("/posts/:id/comment").post(assignUserId, commentPost);
//update a comment in a post
router
  .route("/posts/:postid/comment/:commentid")
  .put(assignUserId, updateComment);

//reply to  a comment in a post
router
  .route("/posts/:postid/comment/:commentid/reply")
  .post(assignUserId, replyComment);

//delete the reply comment in a post
router
  .route("/posts/:postid/comment/:commentid/reply/:replyid")
  .delete(deleteReplyComment);

//delete a comment in a post
router
  .route("/posts/:postid/comment/:commentid")
  .delete(assignUserId, deleteComment);

//share a post
router.route("/posts/:postid/share").post(assignUserId, sharePost);

module.exports = router;
