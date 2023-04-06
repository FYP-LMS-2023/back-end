const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
require("dotenv").config();
//Joi.objectId = require("joi-objectid")(Joi);

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  ERP: {
    type: String,
    required: function () {
      return this.userType != "Admin";
    },
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
      required: function () {
        return this.userType != "Admin";
      },
      validate: {
        validator: function (v) {
          return mongoose.Types.ObjectId.isValid(v);
        },
        message: (props) => `${props.value} is not a valid course id!`,
      },
    },
  ],
  phoneNumber: {
    type: String,
    default: "0000000000",
    required: true,
  },
  CGPA: {
    type: Number,
    default: 0.0,
    required: function () {
      return this.userType != "Admin";
    },
  },
  Program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Program",
    required: function () {
      return this.userType != "Admin";
    },
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

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      email: this.email,
      ERP: this.ERP,
      userType: this.userType,
    },
    process.env.jwtPrivateKey
  );
  return token;
};

const User = new mongoose.model("User", userSchema);

function validateUser(user) {
 
  var schema = Joi.object({
    fullName: Joi.string().min(5).max(50).required(),
    ERP: Joi.string()
      .min(5)
      .max(5)
      .when("userType", {
        not: "Admin",
        then: Joi
          .required()
        }),
      //otherwise: Joi.string().default("00000"),
      //.when("userType", { not: "Admin", then: Joi.required() }),
    email: Joi.string().min(5).max(255).required().email(),
    userType: Joi.string().valid("Student", "Faculty", "Admin").required(),
    password: Joi.string().min(6).required(),
    profilePic: Joi.string().required(),
    phoneNumber: Joi.string().required(),
    courses: Joi.array().when("userType", {
      not: "Admin",
      then: Joi.required(),
    }),
    CGPA: Joi.number()
      .min(0.0)
      .max(4.0)
      .when("userType", { not: "Admin", then: Joi.required() }),
    Program: Joi.string().when("userType", {
      not: "Admin",
      then: Joi.required(),
    }),
    notifications: Joi.array().required(),
  })
  return schema.validate(user);
}

// userSchema.pre("save", async function (next) {
//   if(this.isNew && this.userType === "Student") {
//     const count = await this.constructor.countDocuments({userType: "Student"});
//     this.ERP = (count+1).toString().padStart(5, "0");
//   }
//   next();
// });

module.exports = {
  User,
  validateUser,
};