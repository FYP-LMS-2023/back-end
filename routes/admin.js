const express = require("express");
const router = express.Router();
const adminService = require("../services/adminService");
const asyncMiddleware = require("../middlewares/asyncMiddleware");
const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");

router.get("/getProfile/:id", [auth, admin], asyncMiddleware(adminService.getProfilebyId));
router.get("/getProfile/", [auth, admin], asyncMiddleware(adminService.getProfilebyERP));
router.post("/blockUser/:id", [auth, admin],asyncMiddleware(adminService.blockUserbyId));
router.post("/blockUser/", [auth,admin], asyncMiddleware(adminService.blockUserbyERP));
router.get("/getAllUsers", [auth, admin], asyncMiddleware(adminService.getAllUsers));
router.get("/searchUsers", [auth, admin], asyncMiddleware(adminService.searchUsers));

module.exports = router;
