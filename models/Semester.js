const mongoose = require("mongoose");
const Joi = require("joi");
require("dotenv").config();

const semesterNameRegex = /^(SUMMER|FALL|SPRING)\s\d{4}$/;

const semesterSchema = new mongoose.Schema({
  semesterName: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (v) {
        return semesterNameRegex.test(v);
      },
      message: (props) => `${props.value} is not a valid semester name. Must be in the format of "SEMESTER YEAR", e.g. FALL 2023.`,
    },
  },
  semesterStartDate: {
    type: Date,
    required: true,
  },
  semesterEndDate: {
    type: Date,
    required: true,
  },
});

const Semester = mongoose.model("Semester", semesterSchema);

function validateSemester(semester) {
  var schema = Joi.object({
    semesterName: Joi.string().regex(semesterNameRegex).required().messages({
      'string.pattern.base': 'Semester name must be in the format of "SEMESTER YEAR", e.g. FALL 2023.'
    }),
    semesterStartDate: Joi.date().required(),
    semesterEndDate: Joi.date().required().greater(Joi.ref('semesterStartDate')).messages({
      'any.required': 'Semester end date is required.',
      'date.greater': 'Semester end date must be after the start date.'
    }),
  });

  return schema.validate(semester);
}

module.exports = {
  Semester,
  validateSemester,
}