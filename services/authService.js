const User = require("../models/User.js");

exports.test = (req, res, next) => {
  res.send("Test");
};

exports.createUser = async (req, res, next) => {
  
  const user = new User({
    email: "moosah01@gmail.com",
    fullName: "Moosa Hashim",
    ERP: "2018A7PS0001H",
    userType: "Student",
    notifications: [],
    courses: [],
    password: "123456",
    profilePic: "https://placeholder.png",
    phoneNumber: "0000000000",
    CGPA: 0.0,
    Program: "6425a66e47dcb940dfee5b59",

  }); 
  const result = await user.save();
  if (result) {
    res.status(200).send({
      result,
    });
  } else {
    res.status(400).send({
      message: "Error creating user",
    })
  }
};
