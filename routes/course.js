const express = require("express");
const router = express.Router();
const courseService = require("../services/courseService");
const asyncMiddleware = require("../middlewares/asyncMiddleware");
const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");


router.post("/createCourse", [auth, admin], asyncMiddleware(courseService.createCourse));
router.get("/getAllCourses", auth, asyncMiddleware(courseService.getAllCourses));
router.get("/getCourse/:id", auth, asyncMiddleware(courseService.getCourse));
router.patch("/updateCourse/:id", [auth, admin], asyncMiddleware(courseService.updateCourse));


module.exports = router;