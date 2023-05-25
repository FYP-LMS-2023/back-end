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
  if (validation.error) {
    return res
      .status(400)
      .send({ message: `${validation.error.details[0].message}` });
  }

  const classA = await Classes.findById(req.params.id)
    .populate({
      path: "Quizzes",
      options: { sort: { uploadDate: -1 } }, // Sort by uploadDate in descending order
    })
    .exec();

  if (!classA) {
    return res.status(404).send({ message: "Class with ID not found" });
  }

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

exports.deleteQuiz = async (req, res, next) => {
  const { id } = req.params;
  if (!id) return res.status(400).send({ message: "QuizId is required." });

  const quiz = await Quiz.findById(id);
  if (!quiz)
    return res.status(404).send({ message: "Quiz with ID not found." });

  const classA = await Classes.findById(quiz.classId);
  if (!classA)
    return res.status(404).send({ message: "Class with ID not found." });

  if (!classA.teacherIDs.includes(req.user._id))
    return res.status(401).send({ message: "Unauthorized." });

  //pull quiz from array classA.Quizzes

  const index = classA.Quizzes.indexOf(id);
  if (index > -1) {
    classA.Quizzes.splice(index, 1);
  }

  const result = await classA.save();

  if (!result)
    return res.status(500).send({ message: "Something went wrong." });

  const result2 = await Quiz.findByIdAndDelete(id);
  if (!result2)
    return res.status(500).send({ message: "Something went wrong." });

  res.status(200).send({ message: "Quiz deleted." });
};

exports.getQuizSubmissionsForFaculty = async (req, res, next) => {
  const { id } = req.params;
  if (!id) return res.status(400).send({ message: "QuizId is required." });

  const quiz = await Quiz.findById(id).populate({
    path: "submissions",
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

  if (!quiz)
    return res.status(404).send({ message: "Quiz with ID not found." });

  return res.status(200).send({
    message: "Quiz submissions retrieved successfully.",
    submissions: quiz,
  });
};
