const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  ERP: {
    type: String,
    unique: true,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    validate: {
      validator: function (v) {
        return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(v);
      },
      message: (props) => `${props.value} is not a valid email address!`,
    },
  },
  userType: {
    type: String,
    enum: ["Student", "Faculty", "Admin"],
    required: true,
    default: "Student",
  },
  password: {
    type: String,
    required: true,
  },
  profilePic: {
    type: String,
    default: "https://placeholder.png",
  },
  //we can store a course with an invalid author, that might be an issue
  courses: [
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
  phoneNumer: {
    type: String,
    default: "0000000000",
    required: true,
  },
  CGPA: {
    type: Number,
    default: 0.0,
    required: true,
  },
  Program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Program",
    required: true,
    validat: {
      validator: function (v) {
        return mongoose.Types.ObjectId.isValid(v);
      },
      message: (props) => `${props.value} is not a valid program id!`,
    },
  },
  notifications: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notification",
      required: true,
      validate: {
        validator: function (v) {
          return mongoose.Types.ObjectId.isValid(v);
        },
        message: (props) => `${props.value} is not a valid notification id!`,
      },
    },
  ],
});

const User = new mongoose.model("User", userSchema);

module.exports = User;
