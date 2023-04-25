const express = require("express");
const router = express.Router();
const submissionService = require("../services/submissionService");
const asyncMiddleware = require("../middlewares/asyncMiddleware");
const auth = require("../middlewares/auth");
const faculty = require("../middlewares/faculty");

router.post("/submitQuiz", auth, asyncMiddleware(submissionService.submitQuiz));

module.exports = router;