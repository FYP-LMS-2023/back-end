const jwt = require("jsonwebtoken");
require("dotenv").config();
const { User } = require("../models/User");

module.exports = async function auth(req, res, next) {
  const token = req.header("Authorization");

  if (!token)
    return res
      .status(401)
      .send({ message: "Access denied. No token provided!" });

  try {
    const decoded = jwt.verify(token, process.env.jwtPrivateKey);
    req.user = decoded;
    // console.log(req.user._id)
    const result = await User.findById(req.user._id);
    // console.log(result)
    if (result.deleteFlag)
      return res.status(403).send({ message: "User is blocked by admin!" });
    next();
  } catch (ex) {
    console.log(ex)
    return res.status(400).send({ message: "Invalid token!" });
  }
};
