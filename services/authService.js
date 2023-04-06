const _ = require("lodash");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const { User, validateUser } = require("../models/User.js");
const Program = require("../models/Program");
const { Semester, validateSemester} = require("../models/Semester.js");
const { Announcement, validateAnnouncement } = require("../models/Announcement.js");

exports.test = (req, res, next) => {
  res.send("Test");
};

exports.createUser = async (req, res, next) => {
  var isAdmin = false;

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
  };
  if (req.body?.userType == "Admin") {
    schema = {
      email: req.body?.email,
      fullName: req.body?.fullName,
      userType: req.body?.userType,
      notifications: [],
      password: req.body?.password,
      profilePic: "https://placeholder.png",
      phoneNumber: req.body?.phoneNumber,
    };
    isAdmin = true;
  }

  const { error } = validateUser(schema,res);
  
  if (error)
    return res.status(400).send({ message: `${error.details[0].message}` });

  schema.email = req.body.email.toLowerCase();

  const emailCheck = await User.find({ email: schema.email });
  if (emailCheck.length)
    return res.status(400).send({ message: "User with Email already exists!" });

  if (!isAdmin) {
    const ERPcheck = await User.find({ ERP: req.body.ERP });
    if (ERPcheck.length)
      return res.status(400).send({ message: "User with ERP already exists!" });
  }

  let user = new User(schema);

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  const result = await user.save();

  if (result) {
    const token = user.generateAuthToken();
    if (!isAdmin) {
      return res
        .status(200)
        .header("x-auth-token", token)
        .send(
          _.pick(result, [
            "email",
            "fullName",
            "ERP",
            "userType",
            "courses",
            "profilePic",
            "phoneNumber",
            "CGPA",
            "Program",
            "_id",
          ])
        );
    } else {
      return res
        .status(200)
        .header("x-auth-token", token)
        .send(
          _.pick(result, [
            "email",
            "fullName",
            "userType",
            "profilePic",
            "phoneNumber",
            "_id",
          ])
        );
    }
  } else {
    res.status(500).send({
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
  var Schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().required(),
  });
  const { error } = Schema.validate(_.pick(req.body, ["email", "password"]));
  if (error)
    return res.status(400).send({ message: `${error.details[0].message}` });

    var lowerCaseEmail = req.body.email.toLowerCase();
  let user = await User.findOne({ email: lowerCaseEmail });
  if (!user)
    return res.status(400).send({ message: "Invalid email or password!" });

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword)
    return res.status(400).send({ message: "Invalid email or password!" });

  const token = user.generateAuthToken();

  res.send({ message: "User logged in successfully!", token: token });
};

exports.getProfile = async (req, res, next) => {
  const user = await User.findById(req.user._id).select("-password");
  res.status(200).send(user);
};

exports.createSemester = async (req, res, next) => {

  var schema = {
    semesterName: req.body.semesterName,
    semesterStartDate: req.body.semesterStartDate,
    semesterEndDate: req.body.semesterEndDate,
  };

  const { error } = validateSemester(schema, res);
  if (error){
    console.log("validation error");
    return res.status(400).send({ message: `${error.details[0].message}` });
  }

  let semester = new Semester(schema);
  const result = await semester.save();

  if (result) {
    res.status(200).send({
      message: "Semester created successfully!",
      result,
    });
  } else {
    res.status(500).send({
      message: "Error creating semester",
    });
  }
}

exports.createAnnouncement = async(req, res, next) => {
  var schema = {
    title: req.body.title,
    description: req.body.description,
    datePosted: req.body.datePosted,
    postedBy: req.body.postedBy,
  }

  const user = await User.findById(req.body.postedBy);

  if(!user) {
    return res.status(400).send({ message: "User does not exist!" });
  }

  const { error } = validateAnnouncement(schema, res);
  if (error) {
    console.log("validation error");
    return res.status(400).send({ message: `${error.details[0].message}` });
  }

  let announcement = new Announcement(schema);
  const result = await announcement.save();

  var populatedResult = await result.populate('postedBy', 'fullName -_id');

  if (populatedResult) {
    res.status(200).send({
      message: "Announcement created successfully!",
      populatedResult,
    });
  } else {
    res.status(500).send({
      message: "Error creating announcement",
    });
  }
}