const express = require("express");
const router = express.Router();
const semesterService = require("../services/semesterService");
const asyncMiddleware = require("../middlewares/asyncMiddleware");
const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");

router.post("/createSemester", [auth, admin], asyncMiddleware(semesterService.createSemester));
router.get("/getAllSemesters", [auth], asyncMiddleware(semesterService.getSemesters));


module.exports = router;