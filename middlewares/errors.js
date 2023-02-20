module.exports = function (err, req, res, next) {
  //log exception here
  console.log(err);
  res.status(500).send("Something failed..");
};
