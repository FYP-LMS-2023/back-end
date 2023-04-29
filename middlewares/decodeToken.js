const jwt = require("jsonwebtoken");
require("dotenv").config();
const { User } = require("../models/User");

module.exports = async function decodeToken(req) {
    const token = req.header("Authorization");
  
    if (!token) {
      return {
        status: 401,
        message: "Access denied. No token provided!",
      }
    }
  
    try {
      const decoded = jwt.verify(token, process.env.jwtPrivateKey);
      req.user = decoded;
      const result = await User.findById(req.user._id);
      if (result.deleteFlag) {
        return {
          status: 403,
          message: "User is blocked by admin!",
        }
      }
      return { status: 200, user: result};
    } catch (ex) {
      console.log(ex);
      return {
        status: 400,
        message: "Invalid token!",
      } 
    }
  }