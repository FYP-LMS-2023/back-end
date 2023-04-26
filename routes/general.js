const express = require("express");
const router = express.Router();
const generalService = require("../services/generalService");
const asyncMiddleware = require("../middlewares/asyncMiddleware");
const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin")
const faculty = require("../middlewares/faculty");


router.get("/getMainDashboard", [auth], asyncMiddleware(generalService.getMainDashboard));

module.exports = router;