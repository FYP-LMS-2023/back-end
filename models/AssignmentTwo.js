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
    minlength: [5, "Title must have a minimum length of 5 characters."],
    maxlength: [255, "Title must not exceed 255 characters."],
    validate: {
      validator: function (value) {
        // Check if the value does not consist only of white space characters
        return /^\s*$/.test(value) === false;
      },
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
    minlength: [0, "Description must have a minimum length of 0 characters."],
    maxlength: [4096, "Description must not exceed 1024 characters."],
    default: "No description provided by the instructor.",
    validate: {
      validator: function (value) {
        // Check if the value does not consist only of white space characters
        return /^\s*$/.test(value) === false;
      },
      message: "Description must not consist only of white space characters.",
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
    title: Joi.string()
      .min(5)
      .max(255)
      .pattern(/(.|\s)*\S(.|\s)*/)
      .not()
      .message("Title must not consist only of white space characters.")
      .required(),
    status: Joi.string().valid("active", "closed", "deleted").required(),
    description: Joi.string()
      .min(0)
      .max(1024)
      .pattern(/(.|\s)*\S(.|\s)*/)
      .not()
      .message("Description must not consist only of white space characters.")
      .required(),
    files: Joi.array().items(
      Joi.object({
        url: Joi.string().required(),
        public_id: Joi.string().required(),
      }).unknown(true)
    ),
    //submissions: Joi.array().items(Joi.objectId().required()).optional(),
  });

  return schema.validate(assignment);
}

function validateAssignmentUpdate(assignment) {
  const schema = Joi.object({
    dueDate: Joi.date().empty(""),
    title: Joi.string()
      .min(5)
      .max(255)
      .pattern(/(.|\s)*\S(.|\s)*/)
      .not()
      .message("Title must not consist only of white space characters.")
      .empty(""),
    status: Joi.string().valid("active", "closed", "deleted").empty(""),
    description: Joi.string()
      .min(1) // Minimum length of 1 to ensure it's not empty
      .max(1024)
      .pattern(/(.|\s)*\S(.|\s)*/)
      .not()
      .message("Description must not consist only of white space characters.")
      .empty(""),
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
