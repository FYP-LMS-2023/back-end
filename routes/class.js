const express = require("express");
const router = express.Router();
const classService = require("../services/classService");
const asyncMiddleware = require("../middlewares/asyncMiddleware");
const auth = require("../middlewares/auth");
const faculty = require("../middlewares/faculty");
const admin = require("../middlewares/admin")

router.post("/createClass", [auth, admin], asyncMiddleware(classService.createClass));
router.post("/assignTeacher", [auth, admin], asyncMiddleware(classService.assignTeacher));
router.post("/assignTA", [auth, admin], asyncMiddleware(classService.assignTA));
router.post("/enrollStudent", [auth, admin], asyncMiddleware(classService.enrollStudent));
router.post("/getMyActiveClasses", [auth], asyncMiddleware(classService.getMyActiveClasses));
router.post("/getClassDetailsShaheer", [auth], asyncMiddleware(classService.getClassDetailsShaheer));
router.post("/uploadSyllabus", [auth, faculty], asyncMiddleware(classService.uploadSyllabus));

router.get("/getClassDetails/:classID", [auth], asyncMiddleware(classService.getClassDetails));

module.exports = router;
