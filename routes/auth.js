const express = require("express");
const router = express.Router();
const authService = require("../services/authService");
const asyncMiddleware = require("../middlewares/asyncMiddleware");
const auth = require("../middlewares/auth");

router.get("/test", asyncMiddleware(authService.test));
router.post("/createUser", asyncMiddleware(authService.createUser));
router.post("/login", asyncMiddleware(authService.login));
router.get("/getProfile", auth, asyncMiddleware(authService.getProfile));


router.post("/createAnnouncement", auth, asyncMiddleware(authService.createAnnouncement));


router.post("/createChannel", auth, asyncMiddleware(authService.createChannel));
router.post("/createThread", auth, asyncMiddleware(authService.createThread));
router.post("/createComment", auth, asyncMiddleware(authService.createComment));
router.get("/getChannel/:id", auth, asyncMiddleware(authService.getChannel));

router.post("/createCommentOnThread", auth, asyncMiddleware(authService.createCommentOnThread));
router.post("/replyToComment", auth, asyncMiddleware(authService.replyToComment));
router.get("/getThread/:id", auth, asyncMiddleware(authService.getThread));

router.post("/createCourse", auth, asyncMiddleware(authService.createCourse));
router.get("/getAllCourses", auth, asyncMiddleware(authService.getAllCourses));
router.get("/getCourse/:id", auth, asyncMiddleware(authService.getCourse));
router.patch("/updateCourse/:id", auth, asyncMiddleware(authService.updateCourse));

router.post("/createClass", auth, asyncMiddleware(authService.createClass));


router.post("/createAttendance", auth, asyncMiddleware(authService.createAttendance));
router.get("/getAttendance/:id", auth, asyncMiddleware(authService.getAttendanceOfClass));



module.exports = router;
