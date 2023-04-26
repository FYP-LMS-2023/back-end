const { Channel, validateChannel } = require("../models/Channel.js");
const { Thread, validateThread } = require("../models/Thread.js");
const { Comment, validateComment } = require("../models/Comment.js");
const { User } = require("../models/User.js");
  
  exports.createChannel = async (req, res, next) => {
    var schema = {
      threads: req.body.threads,
    };
    const { error } = validateChannel(schema, res);
  
    if (error) {
      console.log("validation error");
      return res.status(400).send({ message: `${error.details[0].message}` });
    }
  
    let channel = new Channel(schema);
    const result = await channel.save();
  
    if (result) {
      res.status(200).send({
        message: "Channel created successfully!",
        result,
      });
    } else {
      res.status(500).send({
        message: "Error creating channel",
      });
    }
  };
  
  exports.createThread = async (req, res, next) => {
    if (!req.body.channelID) {
      return res.status(400).send({ message: "Channel ID is required!" });
    }
  
    const channelCheck = await Channel.findById(req.body.channelID);
    //const user = await User.findById(req.body.postedBy);
    const user = await User.findOne({ fullName: req.body.postedBy });

  
    if (!user) {
      return res.status(400).send({ message: "User does not exist!" });
    }
  
    if (!channelCheck) {
      return res.status(400).send({ message: "Channel does not exist!" });
    }
  
    var schema = {
      postedBy: user.id,
      title: req.body.title,
      description: req.body.description,
      comments: req.body.comments,
      tags: req.body.tags,
    };
  
    const { error } = validateThread(schema, res);
    if (error) {
      console.log("validation error");
      return res.status(400).send({ message: `${error.details[0].message}` });
    }
  
    let thread = new Thread(schema);
    const result = await thread.save();
  
    if (result) {
      channelCheck.threads.push(result.id);
      await channelCheck.save();
  
      res.status(200).send({
        message: "Thread created successfully!",
        result,
      });
    } else {
      res.status(500).send({
        message: "Error creating thread",
      });
    }
  };
  
  exports.getChannel = async (req, res, next) => {
    const channel = await Channel.findById(req.params.id);
    if (!channel) {
      return res.status(400).send({ message: "Channel does not exist!" });
    }
  
    var populatedChannel = await channel.populate({
      path: "threads",
      populate: [{ path: "postedBy", select: "fullName ERP -_id" }],
      options: { sort: { datePosted: -1 } },
    });
  
    res.status(200).send(populatedChannel);
    // var populatedResult = await channel.populate({
    //   path: 'threads',
    //   populate: [
    //     { path: 'postedBy', select: 'fullName ERP -_id' },
    //     { path: 'comments', populate: { path: 'postedBy', select: 'fullName ERP -_id' } }
    //   ]
    // })
  };
  
  exports.getThread = async (req, res, next) => {
    const thread = await Thread.findById(req.params.id);
    if (!thread) {
      return res.status(400).send({ message: "Thread does not exist!" });
    }
  
    var populatedThread = await thread.populate({
      path: "comments",
      populate: [
        { path: "postedBy", select: "fullName ERP profilePic -_id" },
        {
          path: "replies",
          populate: { path: "userID", select: "fullName ERP profilePic -_id" },
        },
      ],
      options: { sort: { datePosted: -1 } },
    },
    );
  
    if (!populatedThread) {
      return res.status(400).send({ message: "Thread does not exist!" });
    }
    const upvoteCount = populatedThread.upvotes.length;
    const downvoteCount = populatedThread.downvotes.length;

    res.status(200).send({
      upvoteCount,
      downvoteCount,
      ...populatedThread.toObject(),
    });
  };
  
  exports.createCommentOnThread = async (req, res, next) => {
    if (!req.body.threadID) {
      return res.status(400).send({ message: "Thread ID is required!" });
    }
  
    if (!req.body.postedBy) {
      return res.status(400).send({ message: "Posted By is required!" });
    }
  
    const thread = await Thread.findById(req.body.threadID);
  
    if (!thread) {
      return res.status(400).send({ message: "Thread does not exist!" });
    }
  
    const user = await User.findOne({ fullName: req.body.postedBy });
    if (!user) {
      return res.status(400).send({ message: "User does not exist!" });
    }
  
    var schema = {
      postedBy: user.id,
      comment: req.body.comment,
      replies: [],
    };
  
    const { error } = validateComment(schema, res);
    if (error) {
      console.log("validation error");
      return res.status(400).send({ message: `${error.details[0].message}` });
    }
  
    let comment = new Comment(schema);
    const result = await comment.save();
  
    if (result) {
      thread.comments.push(result.id);
      await thread.save();
  
      var populatedResult = await result.populate(
        "postedBy",
        "fullName ERP -_id"
      );
  
      if (!populatedResult) {
        return res.status(500).send({ message: "Error populating comment!" });
      } else {
        res.status(200).send({
          message: "Comment created successfully!",
          result,
        });
      }
    } else {
      res.status(500).send({
        message: "Error creating comment",
      });
    }
  };
  
  exports.replyToComment = async (req, res, next) => {
    if (!req.body.commentID) {
      return res.status(400).send({ message: "Comment ID is required!" });
    }
    if (!req.body.postedBy) {
      return res.status(400).send({ message: "Posted By is required!" });
    }
    if (!req.body.repliedComment) {
      return res.status(400).send({ message: "Comment for reply is required!" });
    }
  
    var comment = await Comment.findById(req.body.commentID);
    if (!comment) {
      return res.status(400).send({ message: "Comment does not exist!" });
    }
  
    var user = await User.findOne({ fullName: req.body.postedBy });
  
    if (!user) {
      return res.status(400).send({ message: "User does not exist!" });
    }
  
    //console.log(user);
  
    comment.replies.push({
      userID: user._id,
      repliedComment: req.body.repliedComment,
    });
  
    const result = await comment.save();
    if (result) {
      res.status(200).send({
        message: "Reply created successfully!",
        result,
      });
    } else {
      res.status(500).send({
        message: "Error creating reply",
      });
    }
  };

  exports.upvoteThread = async (req, res, next) => {
    if(!req.body.userID) {
      return res.status(400).send({ message: "User ID is required!" });
    }
    if(!req.body.threadID) {
      return res.status(400).send({ message: "Thread ID is required!" });
    }
    const user = await User.findById(req.body.userID);
    const thread = await Thread.findById( req.body.threadID );

    if (!user || !thread) {
      return res.status(400).send({ message: "User or Thread does not exist!" });
    }

    const hasUpvoted = thread.upvotes.some((vote) => vote.equals(user._id));
    const hasDownvoted = thread.downvotes.some((vote) => vote.equals(user._id));
  

    if (hasDownvoted) {
      thread.downvotes.pull(user._id);
      thread.upvotes.push(user._id);
    } else if (hasUpvoted) {
      thread.upvotes.pull(user._id);
    } else {
      //upvote the thread
      thread.upvotes.push(user._id);
    }
    await thread.save();
    res.status(200).send({ message: "Upvote successful!", thread });
  
  }

  exports.downvoteThread = async (req, res, next) => {
    if (!req.body.userID) {
      return res.status(400).send({ message: "User ID is required!" });
    }
    if (!req.body.threadID) {
      return res.status(400).send({ message: "Thread ID is required!" });
    }

    const user = await User.findById(req.body.userID);
    const thread = await Thread.findById( req.body.threadID );

    if (!user || !thread) {
      return res.status(400).send({ message: "User or Thread does not exist!" });
    }

    const hasUpvoted = thread.upvotes.some((vote) => vote.equals(user._id));
    const hasDownvoted = thread.downvotes.some((vote) => vote.equals(user._id));
  

    if (hasUpvoted) {
      thread.upvotes.pull(user._id);
      thread.downvotes.push(user._id);
    } else if (hasDownvoted) {
      thread.downvotes.pull(user._id);
    } else {
      //downvote the thread
      thread.downvotes.push(user._id);
    }
    await thread.save();
    res.status(200).send({ message: "Downvote successful!", thread });
  }
  
  //DONT USE THIS ONE
  exports.createComment = async (req, res, next) => {
    //DONT USE THIS ONE
    //DONT USE THIS ONE
    if (!req.body.threadID && !req.body.commentID) {
      return res
        .status(400)
        .send({ message: "Thread ID or Comment ID is required!" });
    }
    if (!req.body.threadID) {
      return res.status(400).send({ message: "Thread ID is required!" });
    }
  
    if (req.body.commentID?.length >= 0) {
      var checkComment = await Comment.findById(req.body.commentID);
      if (!checkComment) {
        return res.status(400).send({ message: "Comment does not exist!" });
      }
    }
  
    const thread = await Thread.findById(req.body.threadID);
  
    const user = await User.findOne({ fullName: req.body.postedBy });
    if (!user) {
      return res.status(400).send({ message: "User does not exist!" });
    }
  
    var schema = {
      postedBy: user.id,
      comment: req.body.comment,
      replies: [],
    };
  
    const { error } = validateComment(schema, res);
  
    if (error) {
      console.log("validation error");
      return res.status(400).send({ message: `${error.details[0].message}` });
    }
  
    let comment = new Comment(schema);
  
    const result = await comment.save();
  
    if (result) {
      var populatedResult = await result.populate(
        "postedBy",
        "fullName ERP -_id"
      );
  
      if (!populatedResult) {
        return res.status(500).send({ message: "Error populating comment!" });
      }
  
      if (checkComment) {
        checkComment.replies.push(result.postedBy, result.comment);
        await checkComment.save();
      } else {
        thread.comments.push(result.id);
        await thread.save();
      }
      res.status(200).send({
        message: "Comment created successfully!",
        populatedResult,
      });
    } else {
      res.status(500).send({
        message: "Error creating comment",
      });
    }
  }; //DONT USE THIS ONE
  