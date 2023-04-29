const express = require("express");
const router = express.Router();
const attendanceService = require("../services/attendanceService");
const asyncMiddleware = require("../middlewares/asyncMiddleware");
const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin")
const faculty = require("../middlewares/faculty");


router.post("/createAttendance", [auth, admin], asyncMiddleware(attendanceService.createAttendance));
router.get("/getAttendanceOfClass/:id", [auth, faculty], asyncMiddleware(attendanceService.getAttendanceOfClass));
router.post("/getAttendanceBySession", [auth, faculty], asyncMiddleware(attendanceService.getAttendanceBySession));
router.get("/getMyAttendanceOfClass/:id", [auth], asyncMiddleware(attendanceService.getMyAttendanceOfClass));
router.post("/toggleAttendance", [auth, faculty], asyncMiddleware(attendanceService.toggleAttendance));
router.get("/getMyAttendanceOfAllActiveClasses", [auth] , asyncMiddleware(attendanceService.getMyAattendanceOfAllActiveClasses));


module.exports = router;