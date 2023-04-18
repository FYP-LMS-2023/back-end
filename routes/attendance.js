const express = require("express");
const router = express.Router();
const attendanceService = require("../services/attendanceService");
const asyncMiddleware = require("../middlewares/asyncMiddleware");
const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin")
const faculty = require("../middlewares/faculty");


router.post("/createAttendance", [auth, admin], asyncMiddleware(attendanceService.createAttendance));
router.get("/getAttendance/:id", [auth, faculty], asyncMiddleware(attendanceService.getAttendanceOfClass));

module.exports = router;