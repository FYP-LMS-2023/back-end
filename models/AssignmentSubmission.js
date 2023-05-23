const mongoose = require("mongoose");
const Joi = require("joi");
require("dotenv").config();
Joi.objectId = require("joi-objectid")(Joi);

const assignmentSubmissionSchema = new mongoose.Schema({
  uploadDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  files: [
    {
      url: {
        type: String,
        required: true,
      },
      public_id: {
        type: String,
        required: true,
      },
    },
  ],
  marksReceived: {
    type: Number,
    default: 0,
  },
  submissionDescription: {
    type: String,
    required: true,
    default: "No submission description provided.",
    minlength: [0, "Title must have a minimum length of 0 characters."],
    maxlength: [2048, "Description must not exceed 2048 characters."],
    // validate: {
    //   validator: function (value) {
    //     // Check if the value contains only white space characters
    //     return /^\s*$/.test(value) === false;
    //   },
    //   message: "Only white space characters are not allowed.",
    // },
  },
  submissionNumber: {
    type: Number,
    required: true,
    default: 0,
  },
  studentID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    validate: {
      validator: function (v) {
        return mongoose.Types.ObjectId.isValid(v);
      },
    },
  },
  returned: {
    type: Boolean,
    default: false,
  },
  returnDate: {
    type: Date,
    default: null,
  },
  returnDescription: {
    type: String,
    default: "No return remarks provided by the instructor.",
    validate: {
      validator: function (value) {
        // Check if the value contains only white space characters
        return /^\s*$/.test(value) === false;
      },
      message: "Only white space characters are not allowed.",
    },
  },
});

const AssignmentSubmission = mongoose.model(
  "AssignmentSubmission",
  assignmentSubmissionSchema
);

function validateAssignmentSubmission(assignmentSubmission) {
  const schema = Joi.object({
    assignmentID: Joi.objectId().required(),
    submissionDescription: Joi.string().required(),
  });
  return schema.validate(assignmentSubmission);
}

module.exports = {
  AssignmentSubmission,
  validateAssignmentSubmission,
};
