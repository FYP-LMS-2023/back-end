const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  answerDescription: {
    type: String,
    required: true,
  },
});

const Answer = mongoose.model("Answer", answerSchema);

module.exports = Answer;
