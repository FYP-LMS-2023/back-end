const mongoose = require("mongoose");
const Joi = require("joi");
require("dotenv").config();


const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true,
    validate: {
      validator: function (v) {
        return mongoose.Types.ObjectId.isValid(v);
      },
    },
    message: (props) => `${props.value} is not a valid class id!`,
  },
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

  });

  return schema.validate(notification);
}

module.exports = {
  Notification,
  validateNotification,
}
