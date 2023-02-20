const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  uploadDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  startDate: {
    type: Date,
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
      message: (props) => `${props.value} is not a valid class id!`,
    },
  },
  status: {
    type: String,
    required: true,
    enum: ["open", "closed", "pending"], //can start later is liye pending
    default: "pending",
  },
  resubmissionsAllowed: {
    type: Number,
    required: true,
    default: 0,
  },
  resubmissionDeadline: {
    type: Date,
  },
  attachments: [
    {
      filename: {
        type: String,
        required: true,
      },
      file: {
        type: Buffer,
        required: true,
      },
      fileSize: {
        type: Number,
        required: true,
      },
      fileType: {
        type: String,
        required: true,
      },
    },
  ],
  submissions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Submission",
      required: true,
      validate: {
        validator: function (v) {
          return mongoose.Types.ObjectId.isValid(v);
        },
        message: (props) => `${props.value} is not a valid submission id!`,
      },
    },
  ],
  questions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
      validate: {
        validator: function (v) {
          return mongoose.Types.ObjectId.isValid(v);
        },
        message: (props) => "%{props.value} is not a valid question id!",
      },
    },
  ],
  marks: {
    type: Number,
    required: true,
    default: 0,
  },
});

//for explanation of this check assignement.js
quizSchema.pre("save", function (next) {
  if (this.dueDate < new Date()) {
    this.status = "closed";
  } else if (this.startDate > new Date()) {
    this.status = "pending";
  } else {
    this.status = "open";
  }
  next();
});

const Quiz = mongoose.model("Quiz", quizSchema);

module.exports = Quiz;
