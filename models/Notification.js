const mongoose = require("mongoose");
const Joi = require("joi");
require("dotenv").config();
const { Classes } = require("./Class");
const {User} = require("./User");


const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  queryTitle: {
    type: String,
    default: " "
  },
  datePosted: {
    type: Date,
    required: true,
    default: Date.now,
  },
  notificationType: {
    type: String,
    required: true,
    enum: ["announcement", "assignment", "attendance", "quiz", "exam", "other", "thread"],
    default: "announcement",
  },
  read: {
    type: Boolean,
    default: false
  },
  link: {
    type: String,
    default: ""
  },
  // classID: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Classes",
  //   validate: {
  //     validator: function (v) {
  //       return mongoose.Types.ObjectId.isValid(v);
  //     },
  //     message: (props) => `${props.value} is not a valid class id!`,
  //   },
  // },
});

const Notification = mongoose.model("Notification", notificationSchema);

function validateNotification(notification) {
  var schema = Joi.object({
    title: Joi.string().min(5).max(50).required(),
    description: Joi.string().min(5).max(255).required(),
    //classId: Joi.objectId().required(),
    datePosted: Joi.date(),
    notificationType: Joi.string()
      .valid("announcement", "assignment", "attendance", "quiz", "exam", "other")
      .required(),
    read: Joi.boolean(),
    link: Joi.string()

  });

  return schema.validate(notification);
}

// async function notifyStudentsAnnouncement(classID, announcement) {
//   const classObj = await Classes.findById(classID).populate("studentList");

//   const newNotification = new Notification({
//     description: announcement.description,
//     //classId: classID,
//     notificationType: "announcement",
//     link: `/class/${classID}/announcement/${announcement._id}`
//   });

//   await newNotification.save();

//   for ( const student of classObj.studentList) {
//     student.notifications.push(newNotification);
//     await student.save();
//   }
// }


async function createNotificationAnnouncement(classID, announcement, courseCode, courseName) {
  const classObj = await Classes.findById(classID).populate("studentList");

  const truncatedDescription = announcement.description.length > 50
    ? announcement.description.substring(0, 47) + "..."
    : announcement.description;

  const newNotification = new Notification({
    title: `New Announcement posted for ${courseCode} - ${courseName}`,
    queryTitle: announcement.title,
    description: truncatedDescription,
    notificationType: "announcement",
    link: `/class/${classID}/announcement/${announcement._id}`
  });

  await newNotification.save();

  for (const student of classObj.studentList) {
    student.notifications.push(newNotification);
    await student.save();
  }
}

async function createNotificationThreadReply(thread, comment, fullName) {
  const threadAuthor = await User.findById(thread.postedBy);
  const truncatedComment = comment.comment.length > 50
    ? comment.comment.substring(0, 47) + "..."
    : comment.comment;

  const newNotification = new Notification({
    title: `New reply to your thread: ${thread.title}`,
    queryTitle: `${thread.title} - comment from ${fullName}`,
    description: truncatedComment,
    notificationType: "thread",
    link: `/thread/${thread._id}/comment/${comment._id}`
  });

  await newNotification.save();
  threadAuthor.notifications.push(newNotification);
  await threadAuthor.save();
}

async function createNotificationCommentReply(thread, comment, reply, replyAuthorFullName) {
  const commentAuthor = await User.findById(comment.postedBy);
  const truncatedReply = reply.repliedComment.length > 50
    ? reply.repliedComment.substring(0, 47) + "..."
    : reply.repliedComment;

  const newNotification = new Notification({
    title: `New reply to your comment in thread ${thread.title}`,
    queryTitle: `${thread.title} --: Reply from ${replyAuthorFullName}`,
    description: truncatedReply,
    notificationType: "thread",
    link: `/thread/${thread._id}/comment/${comment._id}/reply/${reply._id}`
  });

  await newNotification.save();
  commentAuthor.notifications.push(newNotification);
  await commentAuthor.save();
}

module.exports = {
  Notification,
  validateNotification,
  //notifyStudentsAnnouncement,
  createNotificationAnnouncement,
  createNotificationThreadReply,
  createNotificationCommentReply
}
