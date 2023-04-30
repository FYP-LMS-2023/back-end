const mongoose = require("mongoose");
const Joi = require("joi");
require("dotenv").config();
Joi.objectId = require("joi-objectid")(Joi);

const assignmentSchema = new mongoose.Schema({
  uploadDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  title: {
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
      message: (props) => `${props.value} is not a valid class id!`,
    },
  },
  resubmissionsAllowed: {
    type: Number,
    required: true,
    default: 0,
  },
  status: {
    type: String,
    required: true,
    enum: ["open", "closed"],
    default: "open",
  },
  resubmissionDeadline: {
    type: Date,
  },
  description: {
    type: String,
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  filePath: {
    type: String,
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
  marks: {
    type: Number,
    required: true,
    default: 0,
  },
});

// The pre-save middleware function checks whether the dueDate is in the past and sets the status field to 'late' if it is.
// When you create or update an Assignment document, Mongoose will automatically call the pre-save middleware function before
// saving the document to the database. This means that the status field will be set based on the dueDate field whenever an Assignment document is saved or updated
assignmentSchema.pre("save", function (next) {
  if (this.dueDate < new Date()) {
    this.status = "closed";
  } else {
    this.status = "open";
  }
  next();
});

const Assignment = mongoose.model("Assignment", assignmentSchema);

function validateAssignment(assignment) {
  var schema = Joi.object({
    uploadDate: Joi.date().required(),
    dueDate: Joi.date().required(),
    title: Joi.string().min(5).max(50).required(),
    classId: Joi.objectId().required(),
    resubmissionsAllowed: Joi.number().min(0).required(),
    status: Joi.string().valid("open", "closed").required(),
    resubmissionDeadline: Joi.date(),
    description: Joi.string().min(5).max(255).required(),

    filename: Joi.string().min(5).max(255).required(),
    filePath: Joi.string().required(),
    fileSize: Joi.number().min(0).required(),
    fileType: Joi.string().min(5).max(255).required(),

    submissions: Joi.array().items(Joi.objectId()),
    marks: Joi.number().min(0).required(),
  });
  return schema.validate(assignment);
}

module.exports = {
  Assignment,
  validateAssignment,
};
