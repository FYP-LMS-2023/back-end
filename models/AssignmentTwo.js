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
  },
  status: {
    type: String,
    required: true,
    enum: ["active", "closed", "deleted"],
  },
  description: {
    type: String,
    required: true,
  },
  marks: {
    type: Number,
    required: true,
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

module.exports = {
  Assignment,
  validateAssignment,
};
