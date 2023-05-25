const mongoose = require("mongoose");
const Joi = require("joi");
require("dotenv").config();
Joi.objectId = require("joi-objectid")(Joi);

const qestionSchema = new mongoose.Schema({
  questionDescription: {
    type: String,
    required: true,
  },
  answers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Answer",
      required: true,
      validate: {
        validator: function (v) {
          return mongoose.Types.ObjectId.isValid(v);
        },
        message: (props) => `${props.value} is not a valid answer id!`,
      },
    },
  ],
  correctAnswer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Answer",
    required: false,
    default: null,
    message: (props) => `${props.value} is not a valid answer id!`,
  },
  marks: {
    type: Number,
    required: true,
    default: 1,
  },
});

const Question = mongoose.model("Question", qestionSchema);

function validateQuestion(question) {
  var schema = Joi.object({
    questionDescription: Joi.string().min(5).max(100).required(),
    answers: Joi.array().items(Joi.objectId()).required(),
    correctAnswer: Joi.string().min(0),
    marks: Joi.number(),
  });
  return schema.validate(question);
}

module.exports = {
  Question,
  validateQuestion,
};
