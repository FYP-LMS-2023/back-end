const _ = require("lodash");
const Joi = require("joi");
const { User } = require("../models/User");
Joi.objectId = require("joi-objectid")(Joi);

exports.getProfilebyId = async (req, res, next) => {
  var Schema = Joi.object({
    user_ID: Joi.objectId(),
  });

  const { error } = Schema.validate({ user_ID: req.params.id });
  if (error)
    return res.status(400).json({
      message: error.details[0].message,
    });

  const user = await User.findById(req.params.id);

  if (user) {
    if (user.userType != "Admin") {
      return res.json(
        _.pick(user, [
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
      return res.json(
        _.pick(user, [
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
    return res.status(400).send({
      message: "User with ID does not exist!",
    });
  }
};

exports.getProfilebyERP = async (req, res, next) => {
  if (!req.query.ERP)
    return res.status(400).json({
      message: "Please enter ERP in query parameter",
    });

  const user = await User.findOne({ ERP: req.query.ERP });

  if (user) {
    return res.json(
      _.pick(user, [
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
    return res.status(400).send({
      message: `User with ERP: ${req.query.ERP} does not exist!`,
    });
  }
};

exports.blockUserbyId = async (req, res, next) => {
  if (!req.query.flag)
    return res.status(400).json({
      message: "Please enter flag in query parameter",
    });

  var Schema = Joi.object({
    user_ID: Joi.objectId(),
    flag: Joi.boolean().required(),
  });

  const { error } = Schema.validate({
    user_ID: req.params.id,
    flag: req.query.flag,
  });
  if (error)
    return res.status(400).json({
      message: error.details[0].message,
    });

  var user = await User.findById(req.params.id);

  if (!user)
    return res.status(400).json({ message: "User with ID does not exist!" });

  if (user.userType == "Admin")
    return res.status(403).json({
      message: "Access Denied. Cannot block another Admin!",
    });

  user.deleteFlag = req.query.flag;

  await user.save();

  return res.json({
    message: `User's delete flag successfully changed to ${req.query.flag}`,
  });
};

exports.blockUserbyERP = async (req, res, next) => {
  if (!req.query.ERP)
    return res.status(400).json({
      message: "Please enter ERP in query parameter",
    });
  if (!req.query.flag)
    return res.status(400).json({
      message: "Please enter flag in query parameter",
    });

  const { error } = Joi.object({
    flag: Joi.boolean().required(),
    ERP: Joi.string().min(5).max(5).required(),
  }).validate({ flag: req.query.flag, ERP: req.query.ERP });

  if (error) return res.status(400).send({
    message: `${error.details[0].message}`
  })

  var user = await User.findOne({ ERP: req.query.ERP });

  if (user.userType == "Admin")
    return res.status(403).json({
      message: "Access Denied. Cannot block another Admin!",
    });

  user.deleteFlag = req.query.flag;

  await user.save();

  return res.json({
    message: `User's delete flag successfully changed to ${req.query.flag}`,
  });
};
