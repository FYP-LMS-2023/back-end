const express = require("express");
const router = express.Router();
const programService = require("../services/programService");
const asyncMiddleware = require("../middlewares/asyncMiddleware");
const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");

router.post("/createProgram",[auth, admin], asyncMiddleware(programService.createProgram));

router.get("/getProgram/:id", [auth], asyncMiddleware(programService.getProgram));
router.get("/getAllPrograms", [auth], asyncMiddleware(programService.getAllPrograms));

//testing testing

module.exports = router;