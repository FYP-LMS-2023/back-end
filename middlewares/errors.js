module.exports = function (err, req, res, next) {
    //log exception here
  res.status(500).send("Something failed..");
}