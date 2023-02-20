const mongoose = require("mongoose");

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

module.exports = Question;
