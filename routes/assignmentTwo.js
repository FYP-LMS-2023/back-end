const express = require("express");
const router = express.Router();
const assignment2Service = require("../services/assignmentTwoService");
const asyncMiddleware = require("../middlewares/asyncMiddleware");
const auth = require("../middlewares/auth");
const faculty = require("../middlewares/faculty");
const { uploadAssignment, uploadSubmission, uploadResource } = require("../middlewares/upload");

router.post("/createAssignment", [auth, faculty, uploadAssignment.array("files")], asyncMiddleware(assignment2Service.createAssignment));
router.get("/getAssignmentFiles/:id", [auth], asyncMiddleware(assignment2Service.getAssignmentFiles));
router.get("/getAssignment/:id", [auth], asyncMiddleware(assignment2Service.getAssignment));
router.post("/submitAssignment/:id", [auth, uploadSubmission.array("files")], asyncMiddleware(assignment2Service.submitAssignment));

router.get("/getAssignmentSubmissions/:id", [auth, faculty], asyncMiddleware(assignment2Service.getAssignmentSubmissions));

router.post("/gradeAssignmentSubmission/:id", [auth, faculty], asyncMiddleware(assignment2Service.gradeAssignmentSubmission));
router.post(("/resubmitAssignment/:id"), [auth, uploadSubmission.array("files")], asyncMiddleware(assignment2Service.resubmitAssignment));

router.get("/getAllClassAssignments/:id", [auth], asyncMiddleware(assignment2Service.getAllClassAssignments));
router.get("/getAssignmentById/:id", [auth], asyncMiddleware(assignment2Service.getAssignmentById));


module.exports = router;

