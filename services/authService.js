const _ = require("lodash");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const { User, validateUser } = require("../models/User.js");
const {
  Announcement,
  validateAnnouncement,
} = require("../models/Announcement.js");
const { Channel, validateChannel } = require("../models/Channel.js");
const { Thread, validateThread } = require("../models/Thread.js");
const { Comment, validateComment } = require("../models/Comment.js");
const {
  Course,
  validateCourse,
  validateCourseUpdate,
} = require("../models/Course.js");
const { Classes } = require("../models/Class.js");
const { Attendance, validateAttendance } = require("../models/Attendance.js");
const { Semester, validateSemester } = require("../models/Semester.js");

const moment = require("moment");

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

  if (user.deleteFlag)
    return res
      .status(403)
      .send({ message: "Account has been blocked by admin." });

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword)
    return res.status(400).send({ message: "Invalid email or password!" });

  const token = user.generateAuthToken();

  res.send({ message: "User logged in successfully!", token: token });
};

exports.getProfile = async (req, res, next) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) res.status(400).send({ message: "User doesn't exist anymore!" });
  res.status(200).send({ user });
};

exports.createAnnouncement = async (req, res, next) => {
  var schema = {
    title: req.body.title,
    description: req.body.description,
    datePosted: req.body.datePosted,
    postedBy: req.body.postedBy,
  };

  const user = await User.findById(req.body.postedBy);

  if (!user) {
    return res.status(400).send({ message: "User does not exist!" });
  }

  const { error } = validateAnnouncement(schema, res);
  if (error) {
    console.log("validation error");
    return res.status(400).send({ message: `${error.details[0].message}` });
  }

  let announcement = new Announcement(schema);
  const result = await announcement.save();

  var populatedResult = await result.populate("postedBy", "fullName ERP -_id");

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
};

exports.createChannel = async (req, res, next) => {
  var schema = {
    threads: req.body.threads,
  };
  const { error } = validateChannel(schema, res);

  if (error) {
    console.log("validation error");
    return res.status(400).send({ message: `${error.details[0].message}` });
  }

  let channel = new Channel(schema);
  const result = await channel.save();

  if (result) {
    res.status(200).send({
      message: "Channel created successfully!",
      result,
    });
  } else {
    res.status(500).send({
      message: "Error creating channel",
    });
  }
};

exports.createThread = async (req, res, next) => {
  if (!req.body.channelID) {
    return res.status(400).send({ message: "Channel ID is required!" });
  }

  const channelCheck = await Channel.findById(req.body.channelID);
  //const user = await User.findById(req.body.postedBy);
  const user = await User.findOne({ fullName: req.body.postedBy });

  if (!user) {
    return res.status(400).send({ message: "User does not exist!" });
  }

  if (!channelCheck) {
    return res.status(400).send({ message: "Channel does not exist!" });
  }

  var schema = {
    postedBy: user.id,
    title: req.body.title,
    description: req.body.description,
    comments: req.body.comments,
    tags: req.body.tags,
  };

  const { error } = validateThread(schema, res);
  if (error) {
    console.log("validation error");
    return res.status(400).send({ message: `${error.details[0].message}` });
  }

  let thread = new Thread(schema);
  const result = await thread.save();

  if (result) {
    channelCheck.threads.push(result.id);
    await channelCheck.save();

    res.status(200).send({
      message: "Thread created successfully!",
      result,
    });
  } else {
    res.status(500).send({
      message: "Error creating thread",
    });
  }
};

exports.getChannel = async (req, res, next) => {
  const channel = await Channel.findById(req.params.id);
  if (!channel) {
    return res.status(400).send({ message: "Channel does not exist!" });
  }

  var populatedChannel = await channel.populate({
    path: "threads",
    populate: [{ path: "postedBy", select: "fullName ERP -_id" }],
    options: { sort: { datePosted: -1 } },
  });

  res.status(200).send(populatedChannel);
  // var populatedResult = await channel.populate({
  //   path: 'threads',
  //   populate: [
  //     { path: 'postedBy', select: 'fullName ERP -_id' },
  //     { path: 'comments', populate: { path: 'postedBy', select: 'fullName ERP -_id' } }
  //   ]
  // })
};

exports.getThread = async (req, res, next) => {
  const thread = await Thread.findById(req.params.id);
  if (!thread) {
    return res.status(400).send({ message: "Thread does not exist!" });
  }

  var populatedThread = await thread.populate({
    path: "comments",
    populate: [
      { path: "postedBy", select: "fullName ERP -_id" },
      {
        path: "replies",
        populate: { path: "userID", select: "fullName ERP -_id" },
      },
    ],
    options: { sort: { datePosted: -1 } },
  });

  if (!populatedThread) {
    return res.status(400).send({ message: "Thread does not exist!" });
  }
  res.status(200).send(populatedThread);
};

exports.createCommentOnThread = async (req, res, next) => {
  if (!req.body.threadID) {
    return res.status(400).send({ message: "Thread ID is required!" });
  }

  if (!req.body.postedBy) {
    return res.status(400).send({ message: "Posted By is required!" });
  }

  const thread = await Thread.findById(req.body.threadID);

  if (!thread) {
    return res.status(400).send({ message: "Thread does not exist!" });
  }

  const user = await User.findOne({ fullName: req.body.postedBy });
  if (!user) {
    return res.status(400).send({ message: "User does not exist!" });
  }

  var schema = {
    postedBy: user.id,
    comment: req.body.comment,
    replies: [],
  };

  const { error } = validateComment(schema, res);
  if (error) {
    console.log("validation error");
    return res.status(400).send({ message: `${error.details[0].message}` });
  }

  let comment = new Comment(schema);
  const result = await comment.save();

  if (result) {
    thread.comments.push(result.id);
    await thread.save();

    var populatedResult = await result.populate(
      "postedBy",
      "fullName ERP -_id"
    );

    if (!populatedResult) {
      return res.status(500).send({ message: "Error populating comment!" });
    } else {
      res.status(200).send({
        message: "Comment created successfully!",
        result,
      });
    }
  } else {
    res.status(500).send({
      message: "Error creating comment",
    });
  }
};

exports.replyToComment = async (req, res, next) => {
  if (!req.body.commentID) {
    return res.status(400).send({ message: "Comment ID is required!" });
  }
  if (!req.body.postedBy) {
    return res.status(400).send({ message: "Posted By is required!" });
  }
  if (!req.body.repliedComment) {
    return res.status(400).send({ message: "Comment for reply is required!" });
  }

  var comment = await Comment.findById(req.body.commentID);
  if (!comment) {
    return res.status(400).send({ message: "Comment does not exist!" });
  }

  var user = await User.findOne({ fullName: req.body.postedBy });

  if (!user) {
    return res.status(400).send({ message: "User does not exist!" });
  }

  //console.log(user);

  comment.replies.push({
    userID: user._id,
    repliedComment: req.body.repliedComment,
  });

  const result = await comment.save();
  if (result) {
    res.status(200).send({
      message: "Reply created successfully!",
      result,
    });
  } else {
    res.status(500).send({
      message: "Error creating reply",
    });
  }
};

exports.createCourse = async (req, res, next) => {
  const { error } = validateCourse(req.body);
  if (error) {
    return res.status(400).send({ message: `${error.details[0].message}` });
  }

  let course = new Course({
    courseName: req.body.courseName,
    courseCode: req.body.courseCode,
    courseDescription: req.body.courseDescription,
    creditHours: req.body.creditHours,
    classes: [],
  });

  const result = await course.save();
  if (result) {
    res.status(200).send({
      message: "Course created successfully!",
      result,
    });
  } else {
    res.status(500).send({
      message: "Error creating course",
    });
  }
};

exports.getCourse = async (req, res, next) => {
  const { id } = req.params;
  let course;
  if (id.length === 24) {
    course = await Course.findById(req.params.id);
  } else {
    course = await Course.findOne({ courseCode: req.params.id });
  }

  if (!course) {
    return res.status(400).send({ message: "Course does not exist!" });
  }
  res.status(200).send(course);
};

exports.getAllCourses = async (req, res, next) => {
  const courses = await Course.find();
  if (!courses) {
    return res.status(400).send({ message: "No courses found!" });
  }
  res.status(200).send(courses);
};

exports.updateCourse = async (req, res, next) => {
  const { error } = validateCourseUpdate(req.body);
  if (error) {
    return res.status(400).send({ message: `${error.details[0].message}` });
  }

  const { id } = req.params;
  let course = await Course.findById(id);
  if (!course) {
    return res.status(400).send({ message: "Course does not exist!" });
  }

  if (req.body.courseName) {
    course.courseName = req.body.courseName;
  }
  if (req.body.courseDescription) {
    course.courseDescription = req.body.courseDescription;
  }
  if (req.body.creditHours) {
    course.creditHours = req.body.creditHours;
  }

  const result = await course.save();
  if (result) {
    res.status(200).send({
      message: "Course updated successfully!",
      result,
    });
  } else {
    res.status(500).send({
      message: "Error updating course",
    });
  }
};

exports.createClass = async (req, res, next) => {
  if (!req.body.semesterID) {
    return res.status(400).send({ message: "Semester ID is required!" });
  }
  if (!req.body.courseID) {
    return res.status(400).send({ message: "Course ID is required!" });
  }
  if (!req.body.startDate) {
    return res.status(400).send({ message: "Start Date is required!" });
  }

  var course = await Course.findById(req.body.courseID);
  if (!course) {
    return res.status(400).send({ message: "Course does not exist!" });
  }

  var semester = await Semester.findById(req.body.semesterID);
  if (!semester) {
    return res.status(400).send({ message: "Semester does not exist!" });
  }

  if (semester.semesterStartDate > req.body.startDate) {
    return res
      .status(400)
      .send({ message: "Start Date cannot be before semester start date!" });
  }

  var schema = {
    threads: [],
  }


  const { errorChannel } = validateChannel(schema, res);

  if (errorChannel) {
    console.log("validation error");
    return res.status(400).send({ message: `${error.details[0].message}` });
  }

  let channel = new Channel(schema);
  const  channelSave = await channel.save();

  if (!channelSave) {
    return res.status(500).send({ message: "Error creating channel!" });
  }


  var schema2 = {
    semesterID : req.body.semesterID,
    Attendance : [],
    studentList: [],
    Assignments: [],
    syllabus: req.body?.syllabus,
    Quizzes: [],
    TA:[],
    Channel: channelSave._id,
    Announcement: [],
    Resources: [],
    startDate: req.body.startDate,
  }

  var classInsert = new Classes(schema2);
  course.classes.push(classInsert._id);
  await course.save();

  const result = await classInsert.save();
  if (result) {
    res.status(200).send({
      message: "Class created successfully!",
      result,
    });
  } else {  
    res.status(500).send({
      message: "Error creating class",
    });
  }
};

exports.createAttendance = async (req, res, next) => {
  if (!req.body.classID) {
    return res.status(400).send({ message: "Class ID is required!" });
  }
  
  let classes = await Classes.findById(req.body.classID);
  if (!classes) {
    return res.status(400).send({ message: "Class does not exist!" });
  }

  var startDate = classes.startDate;

  var attendanceArr = [];

  var sessions = [];
  sessions.push({
    date: startDate,
    attendance: attendanceArr,
  });

  for (var i = 1; i<28; i ++) {
    const prevDate = moment(sessions[i-1].date);
    let nextDate;

    switch(prevDate.day()){
      case 1: //monday
        nextDate = prevDate.add(2, 'days');
        break;
      case 2: //tuesday
        nextDate = prevDate.add(2, 'days');
        break;
      case 3: //wednesday
        //nextDate = prevDate.day(1).add(7, 'days');
        nextDate = prevDate.add(5, 'days');
        break;
      case 4: //thursday
        nextDate = prevDate.add(5, 'days');
        break;
      case 5: //friday
        nextDate = prevDate.add(1, 'days');
        break;
      case 6: //saturday
        nextDate = prevDate.add(6, 'days');
    }

    var attendanceArr = [];

    sessions.push({
      date: nextDate.toDate(),
      attendance: attendanceArr,
    });
  }

  console.log(sessions)

  var schema = {
    sessions: sessions,
  }

  const { error } = validateAttendance(schema, res);


  if (error) {
    console.log("validation error");
    return res.status(400).send({ message: `${error.details[0].message}` });
  }

  let attendance = new Attendance(schema);
  const result = await attendance.save();
  if (result) {
    classes.Attendance.push(attendance._id);
    await classes.save();
    res.status(200).send({
      message: "Attendance created successfully!",
      result,
    });
  } else {
    res.status(500).send({
      message: "Error creating attendance",
    });
  }
}

exports.getAttendanceOfClass = async (req, res, next) => {
  if (!req.params.id) {
    return res.status(400).send({ message: "Class ID is required!" });
  }
  const resultClass = await Classes.findById(req.params.id);
  if (!resultClass) {
    return res.status(400).send({ message: "Class does not exist!" });
  }
  const resultAttendance = await Attendance.findById(resultClass.Attendance[0]);
  if (!resultAttendance) {
    return res.status(400).send({ message: "Attendance does not exist!" });
  }
  // var returnAttendance = resultAttendance.sessions.map((session) => {
  //   session.formattedDate = moment(session.date).format("DD/MM/YYYY");
  //   session.dayOfWeek = moment(session.date).format("dddd");
  // });

  var returnAttendance = resultAttendance.sessions.map((session) => {
    return {
      ...session.toObject(),
      formattedDate: moment(session.date).format("DD/MM/YYYY"),
      dayOfWeek: moment(session.date).format("dddd")
    }
  });

  res.status(200).send({
    message: "Attendance fetched successfully!",
    returnAttendance,
  });
};

//DONT USE THIS ONE
exports.createComment = async (req, res, next) => {
  //DONT USE THIS ONE
  //DONT USE THIS ONE
  if (!req.body.threadID && !req.body.commentID) {
    return res
      .status(400)
      .send({ message: "Thread ID or Comment ID is required!" });
  }
  if (!req.body.threadID) {
    return res.status(400).send({ message: "Thread ID is required!" });
  }

  if (req.body.commentID?.length >= 0) {
    var checkComment = await Comment.findById(req.body.commentID);
    if (!checkComment) {
      return res.status(400).send({ message: "Comment does not exist!" });
    }
  }

  const thread = await Thread.findById(req.body.threadID);

  const user = await User.findOne({ fullName: req.body.postedBy });
  if (!user) {
    return res.status(400).send({ message: "User does not exist!" });
  }

  var schema = {
    postedBy: user.id,
    comment: req.body.comment,
    replies: [],
  };

  const { error } = validateComment(schema, res);

  if (error) {
    console.log("validation error");
    return res.status(400).send({ message: `${error.details[0].message}` });
  }

  let comment = new Comment(schema);

  const result = await comment.save();

  if (result) {
    var populatedResult = await result.populate(
      "postedBy",
      "fullName ERP -_id"
    );

    if (!populatedResult) {
      return res.status(500).send({ message: "Error populating comment!" });
    }

    if (checkComment) {
      checkComment.replies.push(result.postedBy, result.comment);
      await checkComment.save();
    } else {
      thread.comments.push(result.id);
      await thread.save();
    }
    res.status(200).send({
      message: "Comment created successfully!",
      populatedResult,
    });
  } else {
    res.status(500).send({
      message: "Error creating comment",
    });
  }
}; //DONT USE THIS ONE
