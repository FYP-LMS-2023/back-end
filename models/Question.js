const mongoose = require("mongoose");
const Joi = require("joi");
require("dotenv").config();


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
    required: true,
    validate: {
      validator: function (v) {
        return mongoose.Types.ObjectId.isValid(v);
      },
    },
    message: (props) => `${props.value} is not a valid answer id!`,
  },
});

const Question = mongoose.model("Question", qestionSchema);

function validateQuestion(question) {
  var schema = Joi.object({
    questionDescription: Joi.string().min(5).max(100).required(),
    answers: Joi.array().items(Joi.ObjectId()).required(),
    correctAnswer: Joi.ObjectId().required(),
  });
}

module.exports = {
  Question,
  validateQuestion
}
