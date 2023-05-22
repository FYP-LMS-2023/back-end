const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

require("dotenv").config();

//I want to write a schema for courses

const courseSchema = new mongoose.Schema({
  courseCode: {
    type: String,
    required: true,
    unique: true,
  },
  courseName: {
    type: String,
    required: true,
  },
  creditHours: {
    type: Number,
    required: true,
  },
  courseDescription: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        // Check if the value contains only white space characters
        return /^\s*$/.test(value);
      },
      message: "Only white space characters are not allowed.",
    },
    minlength: 5,
    maxlength: 2048,
  },
  classes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Classes",
      validate: {
        validator: function (v) {
          return mongoose.Types.ObjectId.isValid(v);
        },
        message: (props) => `${props.value} is not a valid class id!`,
      },
    },
  ],
});

const Course = mongoose.model("Course", courseSchema);

function validateCourse(course) {
  const schema = Joi.object({
    courseCode: Joi.string().trim().required(),
    courseName: Joi.string().trim().required(),
    creditHours: Joi.number().required(),
    courseDescription: Joi.string().trim().required(),
    classes: Joi.array().items(Joi.objectId()),
  });
  return schema.validate(course);
}

function validateCourseUpdate(course) {
  const schema = Joi.object({
    courseName: Joi.string().trim().min(1),
    creditHours: Joi.number().min(1),
    courseDescription: Joi.string().trim().min(1),
  }).min(1); // require at least one field to be present
  return schema.validate(course);
}

module.exports = {
  Course,
  validateCourse,
  validateCourseUpdate,
};
