const express = require("express");
const router = express.Router();
const quizService = require("../services/quizService");
const asyncMiddleware = require("../middlewares/asyncMiddleware");
const auth = require("../middlewares/auth");
const faculty = require("../middlewares/faculty");

router.post(
  "/createQuiz",
  [auth, faculty],
  asyncMiddleware(quizService.createQuiz)
);
router.get("/getQuiz/:id", auth, asyncMiddleware(quizService.getQuiz));

router.get(
  "/getQuizByClassID/:id",
  auth,
  asyncMiddleware(quizService.getQuizByClassID)
);

router.get(
  "/getQuizDetailsStudent/:id",
  auth,
  asyncMiddleware(quizService.getQuizDetailsStudent)
);

router.patch(
  "/deleteQuiz/:id",
  [auth, faculty],
  asyncMiddleware(quizService.deleteQuiz)
);

router.get(
  "/getQuizSubmissionsForFaculty/:id",
  [auth, faculty],
  asyncMiddleware(quizService.getQuizSubmissionsForFaculty)
);

module.exports = router;
