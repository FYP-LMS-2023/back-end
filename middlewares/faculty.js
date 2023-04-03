module.exports = function (req, res, next) {
  if (req.user.userType != "Faculty")
    return res.status(403).send({ message: "Access Denied!" });

  next();
};
