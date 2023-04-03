const mongoose = require("mongoose");
const Assignment = require("./Assignment");
const Quiz = require("./Quiz");

const Joi = require("joi");
require("dotenv").config();


const submissionSchema = new mongoose.Schema({
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
  submissionText: {
    type: String,
    //required: true,
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
  marksRecieved: {
    type: Number,
    required: true,
    default: 0,
  },
  dateSubmitted: {
    type: Date,
    required: true,
    default: Date.now,
  },
  submittedFor: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    validate: {
      validator: function (v) {
        return mongoose.Types.ObjectId.isValid(v);
      },
    },
    message: (props) => `${props.value} is not a valid referrence id!`,
  },
  submissionType: {
    type: String,
    required: true,
    enum: ["Assignment", "Quiz"],
  },
  submissionDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  submissionStatus: {
    type: String,
    required: true,
    enum: ["submitted", "resubmitted", "returned"],
    default: "submitted",
  },
  submissionNumber: {
    type: Number,
    required: true,
    default: 1,
  },
  submissionReturned: [
    {
      comment: {
        type: String,
        required: true,
      },
      commentedBy: {
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
      dateCommented: {
        type: Date,
        required: true,
        default: Date.now,
      },
    },
  ],
  submissionGrade: {
    type: Number,
    required: true,
    default: 0,
  },
});

//write a pre save hook to toggle enum status of submissionFor to 'Assignment' or 'Quiz' based on the type of the referringTo object
submissionSchema.pre("save", function (next) {
  if (this.submittedFor instanceof Assignment) {
    this.submissionType = "Assignment";
  } else if (this.submittedFor instanceof Quiz) {
    this.submissionType = "Quiz";
  }
  next();
});

const Submission = mongoose.model("Submission", submissionSchema);

function validateSubmission(submission) {
  var schema = Joi.object({
    studentID: Joi.objectId().required(),
    submissionText: Joi.string().min(5).max(255),
    attachments: Joi.array().items(
      Joi.object({
        filename: Joi.string().min(5).max(255).required(),
        file: Joi.binary().required(),
        fileSize: Joi.number().min(0).required(),
        fileType: Joi.string().min(5).max(255).required(),
      })
    ),
    marksRecieved: Joi.number().min(0).required(),
    dateSubmitted: Joi.date().required(),
    referringTo: Joi.objectId().required(),
    submissionFor: Joi.string().valid("Assignment", "Quiz").required(),
    submissionDate: Joi.date().required(),
    submissionStatus: Joi.string()
      .valid("submitted", "resubmitted", "returned")
      .required(),
    submissionNumber: Joi.number().min(1).required(),
    submissionReturned: Joi.array().items(
      Joi.object({
        comment: Joi.string().min(5).max(255).required(),
        commentedBy: Joi.objectId().required(),
        dateCommented: Joi.date().required(),
      })
    ),
    submissionGrade: Joi.number().min(0).required(),
  });
  return schema.validate(submission);
}
 
module.exports = {
  Submission,
  validateSubmission,
}
