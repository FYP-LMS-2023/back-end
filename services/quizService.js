const { Quiz, validateQuiz } = require("../models/Quiz");
const { Classes, validateClass } = require("../models/Class.js");
const { Submission, validateSubmission } = require("../models/Submission");
const { Question, validateQuestion } = require("../models/Question");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

exports.createQuiz = async (req, res, next) => {
  var schemaQuiz = {
    title: req.body?.title,
    description: req.body?.description,
    dueDate: req.body?.dueDate,
    startDate: req.body?.startDate,
    classId: req.body?.classId,
    status: req.body?.status,
    submissions: [],
    questions: [],
  };

  const { error } = validateQuiz(schemaQuiz);
  if (error)
    return res.status(400).send({ message: `${error.details[0].message}` });

  const resClass = await Classes.findOne({ _id: schemaQuiz.classId });
  if (!resClass) return res.status(400).json({ message: "Invalid ClassId." });

  let quiz = new Quiz(schemaQuiz);

  const result = await quiz.save();

  resClass.Quizzes.push(result._id);

  const result2 = await resClass.save();

  return res.json(result);

  //   for (var i = 0; i < schemaQuiz.questions.length; i++) {
  //     const resQuestion = await Question.findbyId(schemaQuiz.questions[i]);
  //     if (!resQuestion) return res.status(400).json({ message: "Invalid QuestionId." });
  //   }
};

exports.getQuiz = async (req, res, next) => {
  const schema = Joi.object({
    id: Joi.objectId().required(),
  });
  let validation = schema.validate({ id: req.params.id });
  if (validation.error)
    return res
      .status(400)
      .send({ message: `${validation.error.details[0].message}` });

  let quiz = await Quiz.findById(req.params.id).populate({
    path: "questions",
    populate: {
      path: "answers",
    },
  });

  if (!quiz) return res.status(404).send({ message: "Quiz with ID not found" });

  return res.json(quiz);
};

exports.getQuizByClassID = async (req, res, next) => {
  const schema = Joi.object({
    id: Joi.objectId().required(),
  });
  let validation = schema.validate({ id: req.params.id });
  if (validation.error)
    return res
      .status(400)
      .send({ message: `${validation.error.details[0].message}` });

  const classA = await Classes.findById(req.params.id).populate({
    path: "Quizzes",
  });

  if (!classA)
    return res.status(404).send({ message: "Class with ID not found" });

  //console.log(classA.Quizzes);
  return res.json(classA.Quizzes);
};

exports.getQuizDetailsStudent = async (req, res, next) => {
  const schema = Joi.object({
    id: Joi.objectId().required(),
  });

  const validation = schema.validate({ id: req.params.id });
  if (validation.error)
    return res
      .status(400)
      .send({ message: `${validation.error.details[0].message}` });
  const quiz = await Quiz.findById(req.params.id)
    .populate({
      path: "questions",
      populate: {
        path: "answers",
      },
    })
    .populate({
      path: "submissions",
      match: { studentID: req.user._id },
      populate: [
        {
          path: "studentID",
          select: "fullName email profilePic",
        },
        {
          path: "submission.question",
          select: "questionDescription",
        },
        {
          path: "submission.answer",
          select: "answerDescription",
        },
      ],
    });

  if (!quiz) return res.status(404).send({ message: "Quiz with ID not found" });

  return res.json(quiz);
};
