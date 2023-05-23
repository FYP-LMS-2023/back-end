const { Quiz, validateQuiz } = require("../models/Quiz");
const {
  QuizSubmission,
  validateQuizSubmission,
} = require("../models/QuizSubmission");
const { Question, validateQuestion } = require("../models/Question");

const addingMarks = async (resultQuiz, schemaQuizSubmission) => {
  var currMarks = 0;

  //Resulting in synchronisation problems
  // resultQuiz.questions.forEach(async (questionID) => {
  //   const currentQuestion = await Question.findById(questionID);
  //   schemaQuizSubmission.submission.forEach(async (submissionQuestion) => {
  //     if (questionID == submissionQuestion.question) {
  //       if (currentQuestion.correctAnswer == submissionQuestion.answer) {
  //         currMarks = currMarks + currentQuestion.marks;
  //       }
  //     }
  //   });
  // });

  for (var i = 0; i < resultQuiz.questions.length; i++) {
    const currentQuestion = await Question.findById(resultQuiz.questions[i]);
    for (var j = 0; j < schemaQuizSubmission.submission.length; j++) {
      if (currentQuestion._id == schemaQuizSubmission.submission[j].question) {
        if (
          currentQuestion.correctAnswer ==
          schemaQuizSubmission.submission[j].answer
        ) {
          currMarks = currMarks + currentQuestion.marks;
        }
      }
    }
  }
  return currMarks;
};

exports.submitQuiz = async (req, res, next) => {
  var schemaQuizSubmission = {
    studentID: req.user._id,
    marksReceived: 0,
    submittedFor: req.body?.submittedFor,
    submissionDate: Date.now(),
    submission: req.body?.submission,
  };

  const { error } = validateQuizSubmission(schemaQuizSubmission);
  if (error)
    return res.status(400).send({ message: `${error.details[0].message}` });

  const currSubmission = await QuizSubmission.find({
    studentID: req.user._id,
    submittedFor: req.body?.submittedFor,
  });
  if (currSubmission.length !== 0)
    return res.status(403).send({ message: "Quiz already submitted." });

  const resultQuiz = await Quiz.findById(schemaQuizSubmission.submittedFor);

  if (!resultQuiz)
    return res.status(400).send({ message: "Quiz was not found!" });

  if (resultQuiz.startDate > Date.now()) {
    return res.status(400).send({
      message: "Quiz has not started yet. You can't make any submissions yet",
    });
  }

  const marksCalculated = await addingMarks(resultQuiz, schemaQuizSubmission);

  schemaQuizSubmission.marksReceived = marksCalculated;

  let quizSubmission = new QuizSubmission(schemaQuizSubmission);

  const result = await quizSubmission.save();

  // Add the submitted quiz to the quiz's submissions
  resultQuiz.submissions.push(result._id);
  await resultQuiz.save();

  // Populated result
  const populatedQuizSubmission = await QuizSubmission.findById(
    result._id
  ).populate([
    {
      path: "studentID",
      select: "fullName email profilePic",
    },
    {
      path: "submittedFor",
      populate: {
        path: "questions",
        select: "questionDescription marks",
        populate: {
          path: "answers",
          select: "answerDescription",
        },
      },
    },
    {
      path: "submission.question",
      select: "questionDescription marks correctAnswer",
    },
    {
      path: "submission.answer",
      select: "answerDescription",
    },
  ]);

  return res.json(populatedQuizSubmission);
};
