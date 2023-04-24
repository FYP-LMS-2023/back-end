const express = require("express");
const router = express.Router();
const questionService = require("../services/questionService");
const asyncMiddleware = require("../middlewares/asyncMiddleware");
const auth = require("../middlewares/auth");
const faculty = require("../middlewares/faculty");

router.post("/createQuestion", [auth, faculty], asyncMiddleware(questionService.createQuestion));

module.exports = router;