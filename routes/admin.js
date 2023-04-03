const express = require("express");
const router = express.Router();
const adminService = require("../services/adminService");
const asyncMiddleware = require("../middlewares/asyncMiddleware");
const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");

router.get("/getProfilebyId/:id", [auth, admin], asyncMiddleware(adminService.getProfilebyId));

module.exports = router;
