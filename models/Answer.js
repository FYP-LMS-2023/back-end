const mongoose = require("mongoose");
const Joi = require("joi");
require("dotenv").config();

const answerSchema = new mongoose.Schema({
  answerDescription: {
    type: String,
    required: true,
  },
});

const Answer = mongoose.model("Answer", answerSchema);

//validate answer using joi
function validateAnswer(answer) {
  var schema = Joi.object({
    answerDescription: Joi.string().min(1).max(255).required(),
  });
  return schema.validate(answer);
}

module.exports = {
  Answer,
  validateAnswer,
};
