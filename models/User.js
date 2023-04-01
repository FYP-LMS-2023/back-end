const mongoose = require("mongoose");
const Joi = require("joi");
//Joi.objectId = require("joi-objectid")(Joi);

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
    validate: {
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

function validateUser(user) {
  var schema = Joi.object({
    fullName: Joi.string().min(5).max(50).required(),
    ERP: Joi.string().min(5).max(5).required(),
    email: Joi.string().min(5).max(255).required().email(),
    userType: Joi.string().valid("Student", "Faculty", "Admin").required(),
    password: Joi.string().min(6).required(),
    profilePic: Joi.string().required(),
    phoneNumer: Joi.string().required(),
    courses: Joi.array().required(),
    CGPA: Joi.number().min(0.0).max(4.0).required(),
    Program: Joi.string().required(),
    notifications: Joi.array().required(),
  });

  return schema.validate(user);
}
module.exports = {
  User,
  validateUser
}
