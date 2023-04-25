const { Quiz, validateQuiz } = require("../models/Quiz");
const { Classes, validateClass } = require("../models/Class.js");
const { Submission, validateSubmission } = require("../models/Submission");
const { Question, validateQuestion } = require("../models/Question");

exports.submitQuiz = async (req, res, next) => {
  var schemaQuizSubmission = {}

  const { error } = validateSubmission(schemaQuizSubmission);
  if (error)
    return res.status(400).send({ message: `${error.details[0].message}` });

  const resClass = await Classes.findOne({_id: schemaQuiz.classId})
  if (!resClass) return res.status(400).json({ message: "Invalid ClassId." });

  let quiz = new Quiz(schemaQuiz);

  const result = await quiz.save();

  return res.json(result);

  //   for (var i = 0; i < schemaQuiz.questions.length; i++) {
  //     const resQuestion = await Question.findbyId(schemaQuiz.questions[i]);
  //     if (!resQuestion) return res.status(400).json({ message: "Invalid QuestionId." });
  //   }
};

exports.completeQuiz =async (req, res, next) => {

}
