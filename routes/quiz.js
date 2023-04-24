const express = require("express");
const router = express.Router();
const quizService = require("../services/quizService");
const asyncMiddleware = require("../middlewares/asyncMiddleware");
const auth = require("../middlewares/auth");
const faculty = require("../middlewares/faculty");

router.post("/createQuiz", [auth, faculty], asyncMiddleware(quizService.createQuiz));

module.exports = router;