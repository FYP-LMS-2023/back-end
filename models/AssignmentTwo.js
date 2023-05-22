const mongoose = require("mongoose");
const Joi = require("joi");
require("dotenv").config();
Joi.objectId = require("joi-objectid")(Joi);

const assignment2Schema = new mongoose.Schema({
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
    minlength: 5,
    maxlength: 255,
    validate: {
      validator: function (value) {
        // Check if the value contains only white space characters
        return /^\s*$/.test(value);
      },
      message: "Only white space characters are not allowed.",
    },
  },
  status: {
    type: String,
    required: true,
    enum: ["active", "closed", "deleted"],
  },
  description: {
    type: String,
    //required: true,
    minlength: 0,
    maxlength: 1024,
    default: "No description provided by the instructor.",
    validate: {
      validator: function (value) {
        // Check if the value contains only white space characters
        return /^\s*$/.test(value);
      },
      message: "Only white space characters are not allowed.",
    },
  },
  marks: {
    type: Number,
    required: true,
    default: 0,
  },
  files: [
    {
      url: {
        type: String,
        required: false,
      },
      public_id: {
        type: String,
        required: false,
      },
    },
  ],
  submissions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssignmentSubmission",
      required: true,
      validate: {
        validator: function (v) {
          return mongoose.Types.ObjectId.isValid(v);
        },
        message: (props) => `${props.value} is not a valid submission id!`,
      },
    },
  ],
  deleteFlag: {
    type: Boolean,
    default: false,
  },
});

const Assignment = mongoose.model("AssignmentTwo", assignment2Schema);

function validateAssignment(assignment) {
  const schema = Joi.object({
    uploadDate: Joi.date(),
    dueDate: Joi.date().required(),
    title: Joi.string().required(),
    status: Joi.string().valid("active", "closed", "deleted").required(),
    description: Joi.string().required(),
    files: Joi.array().items(
      Joi.object({
        url: Joi.string().required(),
        public_id: Joi.string().required(),
      })
    ),
    submissions: Joi.array().items(Joi.objectId().required()),
  });

  return schema.validate(assignment);
}

function validateAssignmentUpdate(assignment) {
  const schema = Joi.object({
    dueDate: Joi.date().empty(""),
    title: Joi.string().empty(""),
    status: Joi.string().valid("active", "closed", "deleted").empty(""),
    description: Joi.string().empty(""),
    marks: Joi.number().empty(""),
  })
    .or("dueDate", "title", "status", "description", "marks")
    .min(1);

  return schema.validate(assignment);
}

module.exports = {
  Assignment,
  validateAssignment,
  validateAssignmentUpdate,
};
