const express = require("express");
const router = express.Router();
const classService = require("../services/classService");
const asyncMiddleware = require("../middlewares/asyncMiddleware");
const auth = require("../middlewares/auth");
const faculty = require("../middlewares/faculty");
const admin = require("../middlewares/admin")

router.post("/createClass", [auth, admin], asyncMiddleware(classService.createClass));

module.exports = router;
