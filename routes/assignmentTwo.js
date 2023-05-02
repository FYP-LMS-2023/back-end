const express = require("express");
const router = express.Router();
const assignment2Service = require("../services/assignmentTwoService");
const asyncMiddleware = require("../middlewares/asyncMiddleware");
const auth = require("../middlewares/auth");
const faculty = require("../middlewares/faculty");
const uploadAssignment = require("../middlewares/upload");

router.post("/createAssignment", [auth, faculty, uploadAssignment.array("files")], asyncMiddleware(assignment2Service.createAssignment));
router.get("/getAssignmentFiles/:id", [auth], asyncMiddleware(assignment2Service.getAssignmentFiles));

module.exports = router;