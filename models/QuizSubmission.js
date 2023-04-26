const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
require("dotenv").config();

const QuizSubmissionSchema = new mongoose.Schema({
  studentID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    validate: {
      validator: function (v) {
        return mongoose.Types.ObjectId.isValid(v);
      },
    },
    message: (props) => `${props.value} is not a valid user id!`,
  },
  marksReceived: {
    type: Number,
    required: true,
    default: 0,
  },
  submittedFor: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Quiz",
    validate: {
      validator: function (v) {
        return mongoose.Types.ObjectId.isValid(v);
      },
    },
    message: (props) => `${props.value} is not a valid Quiz id!`,
  },
  submissionDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  submission: [
    {
      question: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Question",
        validate: {
          validator: function (v) {
            return mongoose.Types.ObjectId.isValid(v);
          },
        },
        message: (props) => `${props.value} is not a valid Question id!`,
      },
      answer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Answer",
        validate: {
          validator: function (v) {
            return mongoose.Types.ObjectId.isValid(v);
          },
        },
        message: (props) => `${props.value} is not a valid Answer id!`,
      },
    },
  ],
});

const QuizSubmission = mongoose.model("QuizSubmission", QuizSubmissionSchema);

function validateQuizSubmission(submission) {
  var schema = Joi.object({
    studentID: Joi.objectId().required(),
    marksReceived: Joi.number().min(0).required(),
    submittedFor: Joi.objectId().required(),
    submissionDate: Joi.date().required(),
    submission: Joi.array().required(),
  });
  return schema.validate(submission);
}

module.exports = {
  QuizSubmission,
  validateQuizSubmission,
};
