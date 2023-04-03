const mongoose = require("mongoose");
const Joi = require("joi");
require("dotenv").config();

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

function validateQuiz(quiz) {
  var schema = Joi.object({
    title: Joi.string().min(5).max(50).required(),
    description: Joi.string().min(5).max(255).required(),
    uploadDate: Joi.date(),
    dueDate: Joi.date().required(),
    startDate: Joi.date().required(),
    classId: Joi.objectId().required(),
    status: Joi.string().valid("open", "closed", "pending").required(),
    resubmissionsAllowed: Joi.number().min(0).required(),
    resubmissionDeadline: Joi.date(),
    attachments: Joi.array().items(
      Joi.object({
        filename: Joi.string().min(5).max(255).required(),
        file: Joi.binary().required(),
        fileSize: Joi.number().min(0).required(),
        fileType: Joi.string().min(5).max(255).required(),
      })  
    ),
  });
  return schema.validate(quiz);
}

module.exports = {
  Quiz,
  validateQuiz
}
