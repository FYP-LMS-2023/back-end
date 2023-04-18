const express = require("express");
const router = express.Router();
const attendanceService = require("../services/attendanceService");
const asyncMiddleware = require("../middlewares/asyncMiddleware");
const auth = require("../middlewares/auth");


router.post("/createAttendance", auth, asyncMiddleware(attendanceService.createAttendance));
router.get("/getAttendance/:id", auth, asyncMiddleware(attendanceService.getAttendanceOfClass));

module.exports = router;