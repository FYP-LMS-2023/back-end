const mongoose = require("mongoose");
const Joi = require("joi");
require("dotenv").config();
const { Classes } = require("./Class");


const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  // classId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Class",
  //   required: true,
  //   validate: {
  //     validator: function (v) {
  //       return mongoose.Types.ObjectId.isValid(v);
  //     },
  //   },
  //   message: (props) => `${props.value} is not a valid class id!`,
  // },
  datePosted: {
    type: Date,
    required: true,
    default: Date.now,
  },
  notificationType: {
    type: String,
    required: true,
    enum: ["announcement", "assignment", "attendance", "quiz", "exam", "other"],
    default: "announcement",
  },
  read: {
    type: Boolean,
    default: false
  },
  link: {
    type: String,
    default: ""
  }
});

const Notification = mongoose.model("Notification", notificationSchema);

function validateNotification(notification) {
  var schema = Joi.object({
    title: Joi.string().min(5).max(50).required(),
    description: Joi.string().min(5).max(255).required(),
    classId: Joi.objectId().required(),
    datePosted: Joi.date(),
    notificationType: Joi.string()
      .valid("announcement", "assignment", "attendance", "quiz", "exam", "other")
      .required(),
    read: Joi.boolean(),
    link: Joi.string()

  });

  return schema.validate(notification);
}

async function notifyStudentsAnnouncement(classID, announcement) {
  const classObj = await Classes.findById(classID).populate("studentList");

  const newNotification = new Notification({
    title: announcement.title,
    description: announcement.description,
    classId: classID,
    notificationType: "announcement",
    link: `/class/${classID}/announcement/${announcement._id}`
  });

  await newNotification.save();

  for ( const student of classObj.studentList) {
    student.notifications.push(newNotification);
    await student.save();
  }
}

module.exports = {
  Notification,
  validateNotification,
  notifyStudentsAnnouncement
}
