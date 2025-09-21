const multer = require("multer");
let postModel = require("../models/postModel");
const userModel = require("../models/userModel");
const conversationModel = require("../models/conversationModel");
const sendEmail = require("../utils/email");
const messageModel = require("../models/messageModel");
const { io } = require("../socket");

//posting a new post -  almaHub/posts/create
module.exports.createNewPost = async (req, res, next) => {
  const { title, description, media } = req.body;

  try {
    let post = await postModel.create({
      title: title,
      description: description,
      media: media,
      author: req.user,
    });
    return res.status(201).json({
      status: true,
      message: "Post created Successfully",
      post: post,
    });
  } catch (error) {
    return res.status(404).json({
      status: false,
      message: error.message,
    });
  }
};

//get all post - almaHub/posts/getAll?pageNumber=&&limit=
module.exports.getAllPosts = async (req, res, next) => {
  const { page = 1, limit = 2 } = req.query; // Default to page 1 and limit 10 if not provided
  try {
    let posts = await postModel
      .find()
      .sort({ createdAt: -1 }) // Sort posts in descending order of creation
      .populate("author", "name email avatar") // Populate author field with name, email and avatar
      .populate("comments.user", "name email avatar") // Populate comments.user field with name, email and avatar
      .populate("comments.reply.rplyUser", "name email avatar") // Populate comments.reply.rplyUser field with name, email and avatar
      .populate("sharedWith.senderId", "name email avatar") // Populate sharedWith.senderId field with name, email and avatar
      .populate("sharedWith.receiverId", "name email avatar") // Populate sharedWith.receiverId field with name, email and avatar
      .skip((page - 1) * limit) // Skipping posts for pagination
      .limit(Number(limit)) // Limiting the number of posts
      .select("-sharedWith") // Excluding the sharedWith field
      .lean();

    const totalPosts = await postModel.countDocuments(); // Get the total number of posts for pagination

    return res.status(200).json({
      status: true,
      message: "Posts fetched successfully",
      posts: posts,
      totalPosts: totalPosts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit), // Calculate total number of pages
    });
  } catch (error) {
    return res.status(404).json({
      status: false,
      message: error.message,
    });
  }
};
//get a post - almaHub/posts/:id/get
module.exports.getPost = async (req, res, next) => {
  const { postid } = req.params;
  try {
    let post = await postModel.findById(postid).select("-sharedWith").lean();
    if (!post) {
      return res.status(404).json({
        status: false,
        message: "Post not found",
      });
    }
    // const sharedCount = await postModel.aggregate([
    //   {
    //     $match: {
    //       _id: postid,
    //     },
    //   },
    //   {
    //     $project: {
    //       sharedCount: {
    //         $size: "$sharedWith",
    //       },
    //     },
    //   },
    // ]);
    post = await postModel
      .findById(postid)
      .populate("author", "name email avatar")
      .populate("comments.user", "name email avatar")
      .populate("comments.reply.rplyUser", "name email avatar")
      .populate("sharedWith.senderId", "name email avatar")
      .populate("sharedWith.receiverId", "name email avatar");
    return res.status(201).json({
      status: true,
      message: "post fetched successfully",
      post,
      // sharedCount: sharedCount,
    });
  } catch (error) {
    return res.status(404).json({
      status: false,
      message: error.message,
    });
  }
};

//like for a post - almaHub/posts/:id/like
module.exports.likePost = async (req, res, next) => {
  const { id } = req.params;
  try {
    let post = await postModel.findById(id);
    if (!post) {
      return res.status(404).json({
        status: false,
        message: "Post not found",
      });
    }
    const likedIndex = post.likes.indexOf(req.user._id);
    if (likedIndex === -1) {
      post.likes.push(req.user._id);
      message = "post Liked";
    } else {
      post.likes.splice(likedIndex, 1);
      message = "post unliked";
    }
    await post.save();
    post = await postModel
      .findById(id)
      .populate("author", "name email avatar")
      .populate("comments.user", "name email avatar")
      .populate("comments.reply.rplyUser", "name email avatar")
      .populate("sharedWith.senderId", "name email avatar")
      .populate("sharedWith.receiverId", "name email avatar");
    return res.status(201).json({
      status: true,
      message: message,
      post,
    });
  } catch (error) {
    return res.status(404).json({
      status: false,
      message: error.message,
    });
  }
};

//unlike for a post - almaHub/posts/:id/unlike
module.exports.unlikePost = async (req, res, next) => {
  const { id } = req.params;
  try {
    let post = await postModel.findById(id);
    if (!post) {
      return res.status(404).json({
        status: false,
        message: "Post not found",
      });
    }
    const likedIndex = post.likes.indexOf(req.user._id);
    post.likes.splice(likedIndex, 1);
    message = "post unliked";
    await post.save();
    post = await postModel
      .findById(id)
      .populate("author", "name email avatar")
      .populate("comments.user", "name email avatar")
      .populate("comments.reply.rplyUser", "name email avatar")
      .populate("sharedWith.senderId", "name email avatar")
      .populate("sharedWith.receiverId", "name email avatar");
    return res.status(201).json({
      status: true,
      message: message,
      post,
    });
  } catch (error) {
    return res.status(404).json({
      status: false,
      message: error.message,
    });
  }
};

//create a comment - almaHub/posts/:id/comment
module.exports.commentPost = async (req, res, next) => {
  const { id } = req.params;
  const { comment } = req.body;
  try {
    let post = await postModel
      .findById(id)
      .populate("comments.user", "name email avatar")
      .populate("comments.reply.rplyUser", "name email avatar")
      .populate("sharedWith.senderId", "name email avatar");

    if (!post) {
      return res.status(404).json({
        status: false,
        message: "Post not found",
      });
    }

    post.comments.push({
      user: req.user._id,
      comment: comment,
    });

    await post.save();

    post = await postModel
      .findById(id)
      .populate("author", "name email avatar")
      .populate("comments.user", "name email avatar")
      .populate("comments.reply.rplyUser", "name email avatar")
      .populate("sharedWith.senderId", "name email avatar")
      .populate("sharedWith.receiverId", "name email avatar");

    return res.status(201).json({
      status: true,
      message: "Comment posted successfully",
      post,
    });
  } catch (error) {
    return res.status(404).json({
      status: false,
      message: error.message,
    });
  }
};

//update a comment - almaHub/posts/:postid/commment/:commentid
module.exports.updateComment = async (req, res, next) => {
  const { postid, commentid } = req.params;
  const { comment } = req.body;
  try {
    console.log(postid + " " + commentid);

    let post = await postModel.findById(postid);
    if (!post) {
      if (!post) {
        return res.status(404).json({
          status: false,
          message: "Post not found",
        });
      }
    }
    const commentIdx = post.comments.findIndex(
      (cmnt) => cmnt._id.toString() === commentid.toString()
    );

    console.log(commentIdx);
    if (commentIdx == -1) {
      return res.status(404).json({
        status: false,
        message: "can't able to find the requested comment!!",
      });
    } else {
      post.comments[commentIdx].comment = comment;

      await post.save();
      post = await postModel
        .findById(postid)
        .populate("author", "name email avatar")
        .populate("comments.user", "name email avatar")
        .populate("comments.reply.rplyUser", "name email avatar")
        .populate("sharedWith.senderId", "name email avatar")
        .populate("sharedWith.receiverId", "name email avatar");
      return res.status(201).json({
        status: true,
        message: "Comment updated successfully",
        post,
      });
    }
  } catch (error) {
    return res.status(404).json({
      status: false,
      message: error.message,
    });
  }
};

//Reply to a comment - /posts/:postid/comment/:commentid/reply
module.exports.replyComment = async (req, res, next) => {
  const { postid, commentid } = req.params;
  const { comment } = req.body;
  try {
    console.log(postid + " " + commentid);

    let post = await postModel.findById(postid);
    if (!post) {
      if (!post) {
        return res.status(404).json({
          status: false,
          message: "Post not found",
        });
      }
    }
    const commentIdx = post.comments.findIndex(
      (cmnt) => cmnt._id.toString() === commentid.toString()
    );

    console.log(commentIdx);
    if (commentIdx == -1) {
      return res.status(404).json({
        status: false,
        message: "can't able to find the requested comment!!",
      });
    } else {
      post.comments[commentIdx].reply.push({
        rplyUser: req.user._id,
        replyCmnt: comment,
      });

      await post.save();
      post = await postModel
        .findById(postid)
        .populate("author", "name email avatar")
        .populate("comments.user", "name email avatar")
        .populate("comments.reply.rplyUser", "name email avatar")
        .populate("sharedWith.senderId", "name email avatar")
        .populate("sharedWith.receiverId", "name email avatar");
      return res.status(201).json({
        status: true,
        message: "Reply Comment added successfully",
        post,
      });
    }
  } catch (error) {
    return res.status(404).json({
      status: false,
      message: error.message,
    });
  }
};

//delete the reply comment - /posts/:postid/comment/:commentid/reply/:replyid
module.exports.deleteReplyComment = async (req, res, next) => {
  const { postid, commentid, replyid } = req.params;
  try {
    console.log(postid + " " + commentid);

    let post = await postModel.findById(postid);
    if (!post) {
      if (!post) {
        return res.status(404).json({
          status: false,
          message: "Post not found",
        });
      }
    }
    const commentIdx = post.comments.findIndex(
      (cmnt) => cmnt._id.toString() === commentid.toString()
    );

    console.log(commentIdx);
    if (commentIdx == -1) {
      return res.status(404).json({
        status: false,
        message: "can't able to find the requested comment!!",
      });
    } else {
      const replyIdx = post.comments[commentIdx].reply.findIndex(
        (rply) => rply._id == replyid
      );
      if (replyIdx == -1) {
        return res.status(404).json({
          status: false,
          message: "can't able to find the requested reply comment!!",
        });
      } else {
        post.comments[commentIdx].reply.splice(replyIdx, 1);
        await post.save();
        post = await postModel
          .findById(postid)
          .populate("author", "name email avatar")
          .populate("comments.user", "name email avatar")
          .populate("comments.reply.rplyUser", "name email avatar")
          .populate("sharedWith.senderId", "name email avatar")
          .populate("sharedWith.receiverId", "name email avatar");
        return res.status(201).json({
          status: true,
          message: "Reply Comment Deleted successfully",
          post,
        });
      }
    }
  } catch (error) {
    return res.status(404).json({
      status: false,
      message: error.message,
    });
  }
};

//delete a comment - almaHub/posts/:postid/commment/:commentid
module.exports.deleteComment = async (req, res, next) => {
  const { postid, commentid } = req.params;
  try {
    let post = await postModel.findById(postid);
    if (!post) {
      if (!post) {
        return res.status(404).json({
          status: false,
          message: "Post not found",
        });
      }
    }
    const commentIdx = post.comments.findIndex(
      (cmnt) => cmnt._id.toString() === commentid.toString()
    );

    console.log(commentIdx);
    if (commentIdx == -1) {
      return res.status(404).json({
        status: false,
        message: "can't able to find the requested comment!!",
      });
    } else {
      post.comments[commentIdx].deleteOne({
        _id: commentid,
      });
      await post.save();
      post = await postModel
        .findById(postid)
        .populate("author", "name email avatar")
        .populate("comments.user", "name email avatar")
        .populate("comments.reply.rplyUser", "name email avatar")
        .populate("sharedWith.senderId", "name email avatar")
        .populate("sharedWith.receiverId", "name email avatar");
      return res.status(201).json({
        status: true,
        message: "Comment deleted successfully",
        comments: post.comments,
      });
    }
  } catch (error) {
    return res.status(404).json({
      status: false,
      message: error.message,
    });
  }
};

//share a post - almaHub/posts/:postid/share
module.exports.sharePost = async (req, res, next) => {
  const { postid } = req.params;
  const { sharedEmails, message } = req.body;

  try {
    let post = await postModel.findById(postid);
    if (!post) {
      return res.status(404).json({
        status: false,
        message: "Post not found",
      });
    }

    const sharedUsers = await userModel.find({
      email: { $in: sharedEmails },
    });

    if (!sharedUsers.length) {
      return res.status(404).json({
        status: false,
        message: "Requested users not found",
      });
    }

    const alreadyShared = new Set(
      post.sharedWith.map((shrd) => `${shrd.senderId}-${shrd.receiverId}`)
    );
    const newShares = [];

    for (const sharedUser of sharedUsers) {
      const shareKey = `${req.user._id}-${sharedUser._id}`;
      if (!alreadyShared.has(shareKey)) {
        newShares.push({
          senderId: req.user._id,
          receiverId: sharedUser._id,
          postId: postid,
          message: message,
        });
      }
    }

    // if (newShares.length > 0) {
    post.sharedWith.push(...newShares);
    await post.save();

    const convos = [];

    sharedUsers.forEach(async (user) => {
      await getConversations(req.user._id, user._id, post, message);
    });

    // Sending emails asynchronously
    sharedUsers.forEach((user) => {
      sendEmail({
        email: user.email,
        subject: `AlmaHub message Alert from your connection`,
        message: `${req.user.name} has sent you a message. Check it out:
          ${process.env.SERVER_URL}almaHub/posts/${postid}/get`,
      });
    });

    return res.status(201).json({
      status: true,
      message: "Post shared successfully",
      post,
    });
    // }
    // else {
    //   return res.status(400).json({
    //     status: false,
    //     message: "You have already shared the post with all selected users",
    //   });
    // }
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

const getConversations = async (userId, sharedUserId, post, text) => {
  try {
    const conversations = await conversationModel.find({
      participants: { $all: [userId, sharedUserId] },
    });

    const mes = await messageModel.create({
      conversationId: conversations[0]._id,
      sender: userId,
      receiver: sharedUserId,
      text: text,
      post: post,
    });

    const receiverSocketId = getReceiverSocketId(sharedUserId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", mes);
    }
    conversations[0].message.push(mes._id);
    await conversations[0].save();
    return true;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }
};
