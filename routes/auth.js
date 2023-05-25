const express = require("express");
const router = express.Router();
const authService = require("../services/authService");
const asyncMiddleware = require("../middlewares/asyncMiddleware");
const auth = require("../middlewares/auth");
const upload = require("../middlewares/upload");
const admin = require("../middlewares/admin");
const {
  uploadAssignment,
  uploadSubmission,
  uploadResource,
  uploadProfilePicture,
} = require("../middlewares/upload");

router.post("/test", asyncMiddleware(authService.test));
router.post("/createUser",asyncMiddleware(authService.createUser));
router.post("/login", asyncMiddleware(authService.login));
router.get("/getProfile", auth, asyncMiddleware(authService.getProfile));
router.get("/getPopulatedProfile",auth,asyncMiddleware(authService.getPopulatedProfile));
router.post("/updatePassword",auth,asyncMiddleware(authService.updatePassword));
router.post("/uploadProfilePic",[auth, uploadProfilePicture.single("file")],asyncMiddleware(authService.uploadProfilePic));
router.post("/doThisShit", [auth], asyncMiddleware(authService.doThisShit));
router.get("/getFaculty", [auth, admin], asyncMiddleware(authService.getFaculty));
router.get("/getStudents", [auth, admin], asyncMiddleware(authService.getStudents));
//router.post(("/resubmitAssignment/:id"), [auth, uploadSubmission.array("files")], asyncMiddleware(assignment2Service.resubmitAssignment));

module.exports = router;
