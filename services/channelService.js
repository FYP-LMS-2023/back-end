const { Channel, validateChannel } = require("../models/Channel.js");
const { Thread, validateThread } = require("../models/Thread.js");
const { Comment, validateComment } = require("../models/Comment.js");
const { User } = require("../models/User.js");
const { Classes } = require("../models/Class.js");
const {
  createNotificationThreadReply,
  createNotificationCommentReply,
} = require("../models/Notification.js");
const { Reply, validateReply } = require("../models/Reply.js");

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
  const { id } = req.params;

  if (!id) {
    return res.status(400).send({ message: "Channel ID is required!" });
  }

  if (!req.body.title) {
    return res.status(400).send({ message: "Title is required!" });
  }

  const channelCheck = await Channel.findById(id);
  //const user = await User.findById(req.body.postedBy);
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(400).send({ message: "User does not exist!" });
  }

  if (!channelCheck) {
    return res.status(400).send({ message: "Channel does not exist!" });
  }

  const classA = await Classes.findOne({ Channel: id });
  if (!classA) {
    return res.status(400).send({ message: "Class does not exist!" });
  }

  if (
    !classA.studentList.includes(req.user._id) &&
    !classA.TA.includes(req.user._id) &&
    !classA.teacherIDs.includes(req.user._id)
  ) {
    return res
      .status(400)
      .send({ message: "You are not a part of this class!" });
  }

  var schema = {
    postedBy: user.id,
    title: req.body.title,
    description: req.body.description,
    comments: [],
    tags: req.body.tags,
    upvotes: [],
    downvotes: [],
  };

  const { error } = validateThread(schema, res);
  if (error) {
    console.log("validation error");
    return res.status(400).send({ message: `${error.details[0].message}` });
  }

  let thread = new Thread(schema);
  await thread.save();
  const result = await Thread.findById(thread.id).populate({
    path: "postedBy",
    select: "fullName ERP -_id",
  });

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
  const { id } = req.params;
  if (!id) {
    return res.status(400).send({ message: "Channel ID is required!" });
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(400).send({ message: "User does not exist!" });
  }

  const channel = await Channel.findById(id);
  if (!channel) {
    return res.status(400).send({ message: "Channel does not exist!" });
  }
  const classA = await Classes.findOne({ Channel: channel._id });
  if (!classA) {
    return res.status(400).send({ message: "Class does not exist!" });
  }

  if (
    !classA.studentList.includes(req.user._id) &&
    !classA.TA.includes(req.user._id) &&
    !classA.teacherIDs.includes(req.user._id)
  ) {
    return res
      .status(400)
      .send({ message: "You are not a part of this class!" });
  }

  var populatedChannel = await channel.populate({
    path: "threads",
    populate: [{ path: "postedBy", select: "fullName ERP -_id" }],
    options: { sort: { datePosted: -1 } },
    match: { deleteFlag: false },
  });

  res.status(200).send(populatedChannel);
};

// exports.getThread = async (req, res, next) => {
//   const {id} = req.params;

//   const thread = await Thread.findById(id);

//   if (!thread) {
//     return res.status(400).send({ message: "Thread does not exist!" });
//   }

//   var populatedThread =  await Thread.findById(id)
//   .populate({
//     path: "comments",
//     populate: [
//       { path: "postedBy", select: "fullName ERP profilePic -_id" },
//       {
//         path: "replies",
//         populate: { path: "userID", select: "fullName ERP profilePic -_id" },
//       },
//     ],
//     options: { sort: { datePosted: -1 } },
//   })

//   if (!populatedThread) {
//     return res.status(400).send({ message: "Thread does not exist!" });
//   }
//   const upvoteCount = populatedThread.upvotes.length;
//   const downvoteCount = populatedThread.downvotes.length;

//   res.status(200).send({
//     upvoteCount,
//     downvoteCount,
//     ...populatedThread.toObject(),
//   });
// };

// exports.getThread = async (req, res, next) => {
//   const {id} = req.params;

//   const thread = await Thread.findById(id);

//   if (!thread) {
//     return res.status(400).send({ message: "Thread does not exist!" });
//   }

//   var populatedThread =  await Thread.findById(id)
//   .populate({
//     path: "postedBy",
//     select: "fullName ERP profilePic -_id",
//   })
//   .populate({
//     path: "comments",
//     populate: [
//       { path: "postedBy", select: "fullName ERP profilePic -_id" },
//       { path: "upvotes", select: "fullName ERP profilePic -_id"},
//       { path: "downvotes", select: "fullName ERP profilePic -_id" },
//       {
//         path: "replies",
//         populate: [
//           { path: "postedBy", select: "fullName ERP profilePic -_id" },
//           { path: "upvotes", select: "fullName ERP profilePic -_id" },
//           { path: "downvotes", select: "fullName ERP profilePic -_id" },
//         ],
//       },
//     ],
//     options: { sort: { datePosted: -1 } },
//   });

//   if (!populatedThread) {
//     return res.status(400).send({ message: "Thread does not exist!" });
//   }

//   // Upvote and downvote counts for the thread
//   const threadUpvoteCount = populatedThread.upvotes.length;
//   const threadDownvoteCount = populatedThread.downvotes.length;

//   // Calculate upvote and downvote counts for comments and replies
//   populatedThread.comments.forEach(comment => {
//     comment.upvoteCount = comment.upvotes.length;
//     comment.downvoteCount = comment.downvotes.length;
//     comment.replies.forEach(reply => {
//       reply.upvoteCount = reply.upvotes.length;
//       reply.downvoteCount = reply.downvotes.length;
//     });
//   });

//   res.status(200).send({
//     threadUpvoteCount,
//     threadDownvoteCount,
//     ...populatedThread.toObject(),
//   });
// };

exports.getThread = async (req, res, next) => {
  const { id } = req.params;

  const thread = await Thread.findById(id);

  if (!thread) {
    return res.status(400).send({ message: "Thread does not exist!" });
  }

  var populatedThread = await Thread.findById(id)
    .populate({
      path: "postedBy",
      select: "fullName ERP profilePic -_id",
    })
    .populate({
      path: "comments",
      match: { deleteFlag: false },
      populate: [
        { path: "postedBy", select: "fullName ERP profilePic -_id" },
        //{ path: "upvotes", select: "fullName ERP profilePic -_id"},
        //{ path: "downvotes", select: "fullName ERP profilePic -_id" },
        {
          path: "replies",
          match: { deleteFlag: false },
          populate: [
            { path: "postedBy", select: "fullName ERP profilePic -_id" },
            //{ path: "upvotes", select: "fullName ERP profilePic -_id" },
            //{ path: "downvotes", select: "fullName ERP profilePic -_id" },
          ],
        },
      ],
      options: { sort: { datePosted: -1 } },
    });

  if (!populatedThread) {
    return res.status(400).send({ message: "Thread does not exist!" });
  }

  res.status(200).send(populatedThread.toObject());
};

exports.markThreadAsDeleted = async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).send({ message: "Thread ID is required!" });
  }
  const thread = await Thread.findById(id);
  if (!thread) {
    return res.status(400).send({ message: "Thread does not exist!" });
  }
  if (thread.postedBy != req.user._id) {
    return res
      .status(400)
      .send({ message: "You are not allowed to delete this thread!" });
  }

  thread.deleteFlag = true;
  await thread.save();

  res.status(200).send({ message: "Thread deleted successfully!" });
};

exports.markCommentAsDeleted = async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).send({ message: "Comment ID is required!" });
  }
  const comment = await Comment.findById(id);
  if (!comment) {
    return res.status(400).send({ message: "Comment does not exist!" });
  }
  if (comment.postedBy != req.user._id) {
    return res
      .status(400)
      .send({ message: "You are not allowed to delete this comment!" });
  }

  comment.deleteFlag = true;
  await comment.save();

  res.status(200).send({ message: "Comment deleted successfully!" });
};

exports.markReplyAsDeleted = async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).send({ message: "Reply ID is required!" });
  }
  const reply = await Reply.findById(id);
  if (!reply) {
    return res.status(400).send({ message: "Reply does not exist!" });
  }
  if (reply.postedBy != req.user._id) {
    return res
      .status(400)
      .send({ message: "You are not allowed to delete this reply!" });
  }

  reply.deleteFlag = true;
  await reply.save();

  res.status(200).send({ message: "Reply deleted successfully!" });
};

exports.createCommentOnThread = async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).send({ message: "Thread ID is required!" });
  }

  const thread = await Thread.findById(id);

  if (!thread) {
    return res.status(400).send({ message: "Thread does not exist!" });
  }

  if (!req.body.comment) {
    return res.status(400).send({ message: "Comment is required!" });
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(400).send({ message: "User does not exist!" });
  }

  const channel = await Channel.findOne({ threads: id });
  const classA = await Classes.findOne({ Channel: channel._id });

  if (
    !classA.studentList.includes(req.user._id) &&
    !classA.TA.includes(req.user._id) &&
    !classA.teacherIDs.includes(req.user._id)
  ) {
    return res
      .status(400)
      .send({ message: "You are not a part of this class!" });
  }

  var schema = {
    postedBy: user.id,
    comment: req.body.comment,
    replies: [],
    downvotes: [],
    upvotes: [],
  };

  const { error } = validateComment(schema, res);
  if (error) {
    console.log("validation error");
    return res.status(400).send({ message: `${error.details[0].message}` });
  }

  let comment = new Comment(schema);
  const result = await comment.save();

  const fullName = user.fullName;

  if (result) {
    thread.comments.push(result.id);
    await thread.save();

    await createNotificationThreadReply(thread, result, fullName);

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
  const { id } = req.params;
  if (!id) {
    return res.status(400).send({ message: "Comment ID is required!" });
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(400).send({ message: "User does not exist!" });
  }
  const fullName = user.fullName;

  if (!req.body.reply) {
    return res.status(400).send({ message: "Comment for reply is required!" });
  }

  var comment = await Comment.findById(id);
  if (!comment) {
    return res.status(400).send({ message: "Comment does not exist!" });
  }

  var schema = {
    postedBy: user.id,
    reply: req.body.reply,
    downvotes: [],
    upvotes: [],
  };

  const { error } = validateReply(schema, res);
  if (error) {
    console.log("validation error => reply");
    return res.status(400).send({ message: `${error.details[0].message}` });
  }

  let reply = new Reply(schema);
  const replyResult = await reply.save();

  comment.replies.push(replyResult._id);
  const result = await comment.save();

  const thread = await Thread.findOne({ comments: { $in: [id] } });
  if (!thread) {
    return res.status(400).send({ message: "Thread does not exist!" });
  }

  //const newReply = result.replies[result.replies.length - 1];
  await createNotificationCommentReply(thread, comment, replyResult, fullName);

  if (result) {
    res.status(200).send({
      message: "Reply created successfully!",
      result,
      replyResult,
    });
  } else {
    res.status(500).send({
      message: "Error creating reply",
    });
  }
};

exports.upvoteThread = async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).send({ message: "Thread ID is required!" });
  }

  const user = await User.findById(req.user._id);
  const thread = await Thread.findById(id);

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
};

exports.downvoteThread = async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).send({ message: "Thread ID is required!" });
  }

  const user = await User.findById(req.user._id);
  const thread = await Thread.findById(id);

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
};

exports.upvoteComment = async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).send({ message: "Comment ID is required!" });
  }

  const user = await User.findById(req.user._id);
  const comment = await Comment.findById(id);

  if (!user || !comment) {
    return res.status(400).send({ message: "User or Comment does not exist!" });
  }

  const hasUpvoted = comment.upvotes.some((vote) => vote.equals(user._id));
  const hasDownvoted = comment.downvotes.some((vote) => vote.equals(user._id));

  if (hasDownvoted) {
    comment.downvotes.pull(user._id);
    comment.upvotes.push(user._id);
  } else if (hasUpvoted) {
    comment.upvotes.pull(user._id);
  } else {
    //upvote the comment
    comment.upvotes.push(user._id);
  }
  await comment.save();
  res.status(200).send({ message: "Upvote successful!", comment });
};

exports.downvoteComment = async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).send({ message: "Comment ID is required!" });
  }

  const user = await User.findById(req.user._id);
  const comment = await Comment.findById(id);

  if (!user || !comment) {
    return res.status(400).send({ message: "User or Comment does not exist!" });
  }

  const hasUpvoted = comment.upvotes.some((vote) => vote.equals(user._id));
  const hasDownvoted = comment.downvotes.some((vote) => vote.equals(user._id));

  if (hasUpvoted) {
    comment.upvotes.pull(user._id);
    comment.downvotes.push(user._id);
  } else if (hasDownvoted) {
    comment.downvotes.pull(user._id);
  } else {
    //downvote the comment
    comment.downvotes.push(user._id);
  }
  await comment.save();
  res.status(200).send({ message: "Downvote successful!", comment });
};

exports.upvoteReply = async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).send({ message: "Reply ID is required!" });
  }

  const user = await User.findById(req.user._id);
  const reply = await Reply.findById(id);

  if (!user || !reply) {
    return res.status(400).send({ message: "User or Reply does not exist!" });
  }

  const hasUpvoted = reply.upvotes.some((vote) => vote.equals(user._id));
  const hasDownvoted = reply.downvotes.some((vote) => vote.equals(user._id));

  if (hasDownvoted) {
    reply.downvotes.pull(user._id);
    reply.upvotes.push(user._id);
  } else if (hasUpvoted) {
    reply.upvotes.pull(user._id);
  } else {
    //upvote the reply
    reply.upvotes.push(user._id);
  }
  await reply.save();
  res.status(200).send({ message: "Upvote successful!", reply });
};

exports.downvoteReply = async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).send({ message: "Reply ID is required!" });
  }

  const user = await User.findById(req.user._id);
  const reply = await Reply.findById(id);

  if (!user || !reply) {
    return res.status(400).send({ message: "User or Reply does not exist!" });
  }

  const hasUpvoted = reply.upvotes.some((vote) => vote.equals(user._id));
  const hasDownvoted = reply.downvotes.some((vote) => vote.equals(user._id));

  if (hasUpvoted) {
    reply.upvotes.pull(user._id);
    reply.downvotes.push(user._id);
  } else if (hasDownvoted) {
    reply.downvotes.pull(user._id);
  } else {
    //downvote the reply
    reply.downvotes.push(user._id);
  }
  await reply.save();
  res.status(200).send({ message: "Downvote successful!", reply });
};

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
