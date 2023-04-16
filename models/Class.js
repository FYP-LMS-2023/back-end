const mongoose = require("mongoose");
const Joi = require("joi");
require("dotenv").config();

const classSchema = new mongoose.Schema({
  semesterID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Semester",
    required: true,
    validate: {
      validator: function (v) {
        return mongoose.Types.ObjectId.isValid(v);
      },
      message: (props) => `${props.value} is not a valid class id!`,
    },
  },
  teacherID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    validate: {
      validator: function (v) {
        return mongoose.Types.ObjectId.isValid(v);
      },
      message: (props) => `${props.value} is not a valid teacher id!`,
    },
  },
  syllabus: {
    type: String,
    //required: true,
  },
  studenList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      validate: {
        validator: function (v) {
          return mongoose.Types.ObjectId.isValid(v);
        },
        message: (props) => `${props.value} is not a valid student id!`,
      },
    },
  ],
  TA: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      //required: true,
      validate: {
        validator: function (v) {
          return mongoose.Types.ObjectId.isValid(v);
        },
        message: (props) => `${props.value} is not a valid user id for TA!`,
      },
    },
  ],
  Channel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Channel",
    required: true,
    validate: {
      validtor: function (v) {
        return mongoose.Types.ObjectId.isValid(v);
      },
      message: (props) => `${props.value} is not a valid channel id!`,
    },
  },
  Announcement: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Announcement",
      required: true,
      validate: {
        validator: function (v) {
          return mongoose.Types.ObjectId.isValid(v);
        },
        message: (props) => `${props.value} is not a valid announcement id!`,
      },
    },
  ],
  Quizes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      //required: true,
      validate: {
        validator: function (v) {
          return mongoose.Types.ObjectId.isValid(v);
        },
        message: (props) => `${props.value} is not a valid quiz id!`,
      },
    },
  ],
  Resources: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      required: true,
      validate: {
        validator: function (v) {
          return mongoose.Types.ObjectId.isValid(v);
        },
        message: (props) => `${props.value} is not a valid resource id!`,
      },
    },
  ],
  Assignments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
      validate: {
        validator: function (v) {
          return mongoose.Types.ObjectId.isValid(v);
        },
        message: (props) => `${props.value} is not a valid assignment id!`,
      },
    },
  ],
  Attendance: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attendance",
      validate: {
        validator: function (v) {
          return mongoose.Types.ObjectId.isValid(v);
        },
        message: (props) => `${props.value} is not a valid attendance id!`,
      },
    },
  ],
});

const Class = new mongoose.model("Class", classSchema);

function validateClass(classes) {
  var schema = Joi.object({
    semesterID: Joi.objectId.required(),
    teacherID: Joi.objectId().required(),
    syllabus: Joi.string(),
    studenList: Joi.array().items(Joi.objectId()),
    TA: Joi.array().items(Joi.objectId()),
    Channel: Joi.objectId().required(),
    Announcement: Joi.array().items(Joi.objectId()),
    Quizes: Joi.array().items(Joi.objectId()),
    Resources: Joi.array().items(Joi.objectId()),
    Assignments: Joi.array().items(Joi.objectId()),
    Attendance: Joi.array().items(Joi.objectId()),
  });

  return schema.validate(classes);
}

module.exports = {
  Class,
  validateClass,
}