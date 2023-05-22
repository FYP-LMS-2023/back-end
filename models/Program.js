const mongoose = require("mongoose");
const Joi = require("joi");
require("dotenv").config();
Joi.objectId = require("joi-objectid")(Joi);

const programSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (value) {
        // Check if the value contains only white space characters
        return /^\s*$/.test(value);
      },
      message: "Only white space characters are not allowed.",
    },
    minlength: 4,
    maxlength: 255,
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  electives: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      validate: {
        validator: function (v) {
          return mongoose.Types.ObjectId.isValid(v);
        },
        message: (props) => `${props.value} is not a valid course id!`,
      },
    },
  ],
  cores: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      validate: {
        validator: function (v) {
          return mongoose.Types.ObjectId.isValid(v);
        },
        message: (props) => `${props.value} is not a valid course id!`,
      },
    },
  ],
  faculty: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      validate: {
        validator: function (v) {
          return mongoose.Types.ObjectId.isValid(v);
        },
        message: (props) => `${props.value} is not a valid user id!`,
      },
    },
  ],
});

const Program = mongoose.model("Program", programSchema);

function validateProgram(program) {
  var schema = Joi.object({
    name: Joi.string().required(),
    code: Joi.string().required().uppercase(),
    description: Joi.string().required(),
    electives: Joi.array().items(Joi.objectId()),
    cores: Joi.array().items(Joi.objectId()),
    faculty: Joi.array().items(Joi.objectId()),
  });
  return schema.validate(program);
}

module.exports = {
  Program,
  validateProgram,
};
