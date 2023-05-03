const express = require("express");
const router = express.Router();
const assignmentService = require("../services/assignmentService");
const asyncMiddleware = require("../middlewares/asyncMiddleware");
const auth = require("../middlewares/auth");
const faculty = require("../middlewares/faculty");
const upload = require("../middlewares/upload");

//router.post("/createAssignment", [auth, faculty, upload.single("file")], asyncMiddleware(assignmentService.createAssignment));


module.exports = router;