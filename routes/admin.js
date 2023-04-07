const express = require("express");
const router = express.Router();
const adminService = require("../services/adminService");
const asyncMiddleware = require("../middlewares/asyncMiddleware");
const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");

router.get("/getProfile/:id", [auth, admin], asyncMiddleware(adminService.getProfilebyId));
router.get("/getProfile/", [auth, admin], asyncMiddleware(adminService.getProfilebyERP));
router.post("/blockUser/:id", [auth, admin],asyncMiddleware(adminService.blockUserbyId));
router.post("/blockUser/", [auth,admin], asyncMiddleware(adminService.blockUserbyERP))
router.post("/createProgram",[auth, admin], asyncMiddleware(adminService.createProgram));
router.post("/createSemester", [auth, admin], asyncMiddleware(adminService.createSemester));
module.exports = router;
