const { Quiz, validateQuiz } = require("../models/Quiz");
const { Classes, validateClass } = require("../models/Class");
const { Submission, validateSubmission } = require("../models/Submission");
const { Question, validateQuestion } = require("../models/Question");

exports.createQuestion = async (req, res, next) => {
  //quizId
  if (!req.body.quizID) {
    return res.status(400).send({ message: "quizID required." });
  }
  var schemaQuestion = {
    questionDescription: req.body?.questionDescription,
    answers: [],
    correctAnswer: req.body?.correctAnswer,
    marks: req.body?.marks,
  };
  const { error } = validateQuestion(schemaQuestion);
  if (error)
    return res.status(400).send({ message: `${error.details[0].message}` });

  let question = new Question(schemaQuestion);
  const result = await question.save();

  const quiz = await Quiz.findById(req.body.quizID);

  quiz.questions.push(result._id);

  quiz.marks = quiz.marks + result.marks;

  const finalResult = await quiz.save();

  return res.json(finalResult);
};
