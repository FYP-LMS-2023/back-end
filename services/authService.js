const {User, validateUser} = require("../models/User.js");

const Program = require("../models/Program");

exports.test = (req, res, next) => {
  res.send("Test");
};

exports.createUser = async (req, res, next) => {

  var schema = {
    email: req.body?.email,
    fullName: req.body?.fullName,
    ERP: req.body?.ERP,
    userType: req.body?.userType,
    notifications: [],
    courses: [],
    password: req.body?.password,
    profilePic: "https://placeholder.png",
    phoneNumber: req.body?.phoneNumber,
    CGPA: req.body?.CGPA,
    Program: "6425a66e47dcb940dfee5b59",
  }

  const {error} = validateUser(schema)
  if (error) return res.status(400).send({message: error.details[0].message})

  let user = new User(schema);
  const result = await user.save();

  if (result) {
    res.status(200).send({
      result,
    });
  } else {
    res.status(400).send({
      message: "Error creating user",
    });
  }
};

exports.createProgram = async (req, res, next) => {
  const program = new Program({
    name: "Bachelors Of Science in Computer Science",
    code: "BSCS",
    description:
      "The Department of Computer Science is one of the two departments at the School of Mathematics and Computer Science (SMCS) at the Institute of Business Administration (IBA) Karachi. The department offers bachelor, master and doctoral degree programs in Computer Science. The department has recently launched a long-awaited master's program in Data Science.",
    electives: [],
    cores: [],
    faculty: [],
  });

  const result = await program.save();

  if (result) {
    res.status(200).send({
      result,
    });
  } else {
    res.status(400).send({
      mssg: "error!",
    });
  }
};

exports.login = async (req, res, next) => {

};
