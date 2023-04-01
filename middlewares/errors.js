module.exports = function (err, req, res, next) {
  //log exception here
  console.log(err)
 
  // if (err._message.includes("validation")){
  //   return res.status(400).send({
  //     message: err._message
  //   })
  // }
  return res.status(500).send("Something failed.. Please try again later");
};
