const { Quiz, validateQuiz } = require("../models/Quiz");
const { Classes, validateClass } = require("../models/Class");
const { Submission, validateSubmission } = require("../models/Submission");
const { Question, validateQuestion } = require("../models/Question");
const { Answer, validateAnswer } = require("../models/Answer");

exports.createAnswer = async (req, res, next) => {
  // answerDescription: String
  // QuestionId: Question Id
  // correctAnswer: true/false

  if (!req.body?.QuestionId) {
    return res.status(400).send({ message: "Question ID required" });
  }

  if (req.body?.correctAnswer === undefined) {
    return res.status(400).send({ message: "Correct Answer flag required" });
  }
  var schemaAnswer = {
    answerDescription: req.body?.answerDescription,
  };

  console.log("printing qID in createanswer");
  console.log(req.body.QuestionId);

  const question = await Question.findById(req.body?.QuestionId);

  if (!question)
    return res.status(400).send({ message: "Invalid Question ID" });

  const { error } = validateAnswer(schemaAnswer);
  if (error)
    return res.status(400).send({ message: `${error.details[0].message}` });

  let answer = new Answer(schemaAnswer);
  const result = await answer.save();

  //console.log(question);

  question.answers.push(result._id);

  if (req.body.correctAnswer) {
    question.correctAnswer = result._id;
  }

  const finalResult = await question.save();

  return res.json(finalResult);
};
