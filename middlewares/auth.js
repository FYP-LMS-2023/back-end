const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = function auth(req, res, next) {
  const token = req.header("Authorization");

  if (!token)
    return res
      .status(401)
      .send({ message: "Access denied. No token provided!" });

  try {
    const decoded = jwt.verify(token, process.env.jwtPrivateKey);
    req.user = decoded;
    next();
  } catch (ex) {
    return res.status(400).send({ message: "Invalid token!" });
  }
}
