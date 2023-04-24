const express = require("express");
const router = express.Router();
const AnswerService = require("../services/answerService");
const asyncMiddleware = require("../middlewares/asyncMiddleware");
const auth = require("../middlewares/auth");
const faculty = require("../middlewares/faculty");

router.post("/createAnswer", [auth, faculty], asyncMiddleware(AnswerService.createAnswer));

module.exports = router;