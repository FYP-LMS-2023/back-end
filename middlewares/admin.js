module.exports = function (req, res, next) {
  if (req.user.userType != "Admin")
    return res.status(403).send({ message: "Access Denied!" });

  next();
};
