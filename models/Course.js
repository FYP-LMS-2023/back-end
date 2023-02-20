const mongoose = require("mongoose");

//I want to write a schema for courses

const courseSchema = new mongoose.Schema({
  courseCode: {
    type: String,
    required: true,
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
  },
  classes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
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

module.exports = Course;
