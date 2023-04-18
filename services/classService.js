const { Classes } = require("../models/Class.js");
const { Semester, validateSemester } = require("../models/Semester.js");
const { Channel, validateChannel } = require("../models/Channel.js");

const {
  Course,
  validateCourse,
  validateCourseUpdate,
} = require("../models/Course.js");

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
  