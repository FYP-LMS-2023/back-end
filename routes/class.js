const express = require("express");
const router = express.Router();
const classService = require("../services/classService");
const asyncMiddleware = require("../middlewares/asyncMiddleware");
const auth = require("../middlewares/auth");

router.post("/createClass", auth, asyncMiddleware(classService.createClass));

module.exports = router;
