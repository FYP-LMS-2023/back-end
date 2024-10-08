const _ = require("lodash");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const formidable = require("formidable");
const { User, validateUser } = require("../models/User.js");
const Test = require("../models/test");
const { Program } = require("../models/Program");

exports.test = async (req, res, next) => {
  //get base64 db
  // const result = await Test.find();
  // console.log(result[0].file.valueOf());
  // var base64String = btoa(
  //   String.fromCharCode.apply(null, new Uint8Array(result[0].file))
  // );

  return res.json({ message: "suck cock" });

  //upload base64 to db

  // const newTest = new Test({
  //   file: req.body.file,
  // });

  // const result = await newTest.save();
  // return res.json({ result });
  // const form = formidable({ multiples: true });

  // form.parse(req, (err, fields, files) => {
  //   if (err) {
  //     console.log(err);
  //     return res.send({ message: "error reading form data" });
  //   }

  //   return res.json({ fields, fixes });
  // });
  // console.log(req.body)
  // res.send({message: "This is not a test!"});
};

exports.createUser = async (req, res, next) => {
  var isAdmin = false;

  if (req.body?.userType != "Admin") {
    if (!req.body.program) {
      return res.status(400).send({ message: "Program needs to be specified" });
    }
  }

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
    Program: req.body.program,
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

  const { error } = validateUser(schema);

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

    let program = await Program.findById(req.body.program);
    if (!program)
      return res.status(400).send({ message: "Program doesn't exist!" });
  }

  let user = new User(schema);

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  const result = await user.save();

  if (req.body.userType === "Faculty") {
    let program = await Program.findById(req.body.program);
    program.faculty.push(result._id);
    await program.save();
  }

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
    return res.status(401).send({ message: "Invalid email or password!" });
  let isAdmin = false;
  if (user.userType === "Admin") {
    isAdmin = true;
  }
  if (user.deleteFlag)
    return res
      .status(403)
      .send({ message: "Account has been blocked by admin." });

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword)
    return res.status(401).send({ message: "Invalid email or password!" });

  const token = user.generateAuthToken();

  res.send({
    message: "User logged in successfully!",
    token: token,
    isAdmin: isAdmin,
  });
};

exports.getProfile = async (req, res, next) => {
  //const user = await User.findById(req.user._id).select("-password");
  const user = await User.findById(req.user._id);
  if (!user) res.status(400).send({ message: "User doesn't exist anymore!" });
  res.status(200).send({ user });
};

exports.getPopulatedProfile = async (req, res, next) => {
  const user = await User.findById(req.user._id)
    .populate({
      path: "courses",
      select: "courseCode courseName",
    })
    .populate({
      path: "Program",
      select: "name code",
    })
    .select("-password");

  if (!user) {
    return res.status(400).send({ message: "User doesn't exist anymore!" });
  }
  res.status(200).send({ user });
};

exports.testing = async (req, res, next) => {
  res.status(200).send({ message: "Testing" });
};

exports.submitFormApi = async (req, res, next) => {
  // Log the request body
  console.log("Request Body:", req.body);

  // Log each individual component in the request body
  Object.keys(req.body).forEach((key) => {
    console.log(`${key}: ${req.body[key]}`);
  });

  //log the auth header
  console.log("Auth Header:", req.headers.authorization);

  console.log("break");
  console.log("break");
  console.log("now printing all headers");
  console.log(req.headers);

  // Respond to the client
  res.status(200).send({ message: "Form data received" });
};

exports.uploadProfilePic = async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) res.status(400).send({ message: "User doesn't exist anymore!" });
  try {
    const file = req.file;

    console.log(req.file);
    console.log(file);

    if (!file) {
      return res.status(400).send({ message: "No file uploaded" });
    }

    if (file.size > 1024 * 1024 * 3) {
      return res.status(400).send({ message: "File size too large" });
    }

    const fileDetails = {
      url: file.path,
      public_id: file.filename,
      format: file.mimetype,
    };

    res.status(200).send({
      message: "File uploaded successfully!",
      fileDetails: fileDetails,
    });
  } catch (ex) {
    console.error(ex); // log the exception to see more details about the error
    return res.status(400).send({ message: "No file uploaded => Exception" });
  }
};

exports.doThisShit = async (req, res, next) => {
  const newProfilePicUrl =
    "https://res.cloudinary.com/dixie2mle/image/upload/v1684248194/profile_pictures/1684248190243-placeholder.png.png";

  const updateResult = await User.updateMany(
    {},
    { profilePic: newProfilePicUrl }
  );

  console.log(updateResult);

  if (updateResult.ok !== 1) {
    return res
      .status(500)
      .send({ message: "Failed to update profile pictures" });
  }

  res.status(200).send({
    message: `${updateResult.nModified} profile pictures updated successfully!`,
    result: updateResult,
  });
};

exports.updatePassword = async (req, res, next) => {
  if (!req.body.currPass) {
    return res.status(400).send({ message: "currPass is required!" });
  }
  if (!req.body.newPass) {
    return res.status(400).send({ message: "newPass is required!" });
  }
  if (!req.body.confirmPass) {
    return res.status(400).send({ message: "confirmPass is required!" });
  }

  const user = await User.findById(req.user._id);
  const validPassword = await bcrypt.compare(req.body.currPass, user.password);
  if (!validPassword)
    return res.status(401).send({ message: "Invalid current Password!" });

  if (req.body.newPass !== req.body.confirmPass) {
    return res
      .status(400)
      .send({ message: "New Password and Confirm Password don't match!" });
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(req.body.newPass, salt);

  const result = await user.save();

  return res.json({ message: "Password updated successfully!" });
};

exports.getFaculty = async (req, res, next) => {
  const faculty = await User.find({ userType: "Faculty" });
  if (faculty.length === 0) {
    return res.status(404).send({ message: "No faculty members!" });
  }
  return res.json(faculty);
};

exports.getStudents = async (req, res, next) => {
  const students = await User.find({ userType: "Student" });
  if (students.length === 0) {
    return res.status(404).send({ message: "No students!" });
  }
  return res.json(students);
};
