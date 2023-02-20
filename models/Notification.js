const mongoose = require("mongoose");

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

module.exports = Notification;
