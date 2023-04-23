const { Classes } = require("../models/Class.js");
const { Semester, validateSemester } = require("../models/Semester.js");
const { Channel, validateChannel } = require("../models/Channel.js");
const { User } = require("../models/User.js");
const { Attendance } = require("../models/Attendance.js");


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

  exports.assignTeacher = async (req, res, next) => {
    if(!req.body.classID){
      return res.status(400).send({message: "Class ID is required!"});
    }
    if(!req.body.teacherID){
      return res.status(400).send({message: "Teacher ID is required!"});
    }
    var classObj = await Classes.findById(req.body.classID);
    if(!classObj){
      return res.status(400).send({message: "Class does not exist!"});
    }
    var teacher =  await User.findById(req.body.teacherID);
    if(!teacher){
      return res.status(400).send({message: "Teacher does not exist!"});
    }
    if(teacher.userType != "Faculty"){
      return res.status(400).send({message: "User is not a teacher!"});
    }
    if (classObj.teacherIDs.includes(req.body.teacherID)) {
      return res.status(400).send({ message: "Teacher already assigned!" });
    }
    if (classObj.teacherIDs.length >= 1) {
      return res.status(400).send({ message: "Class already has a teacher!" });
    }
    classObj.teacherIDs.push(req.body.teacherID);
    const result = await classObj.save();
    if (result) {
      res.status(200).send({
        message: "Teacher assigned successfully!",
        result,
      });
    } else {
      res.status(500).send({
        message: "Error assigning teacher",
      });
    }
  }

  exports.assignTA = async (req, res, next) => {
    if(!req.body.classID){
      return res.status(400).send({message: "Class ID is required!"});
    }
    if(!req.body.taID){
      return res.status(400).send({message: "TA ID is required!"});
    }
    var classObj = await Classes.findById(req.body.classID);
    if(!classObj){
      return res.status(400).send({message: "Class does not exist!"});
    }
    var student = await User.findById(req.body.taID);
    if(!student){
      return res.status(400).send({message: "Student does not exist!"});
    }
    if(student.userType != "Student"){
      return res.status(400).send({message: "User is not a student!"});
    }
    if (classObj.TA.includes(req.body.taID)) {
      return res.status(400).send({ message: "Student already assigned!" });
    }
    classObj.TA.push(req.body.taID);
    const result = await classObj.save();
    if (result) {
      res.status(200).send({
        message: "TA assigned successfully!",
        result,
      });
    } else {
      res.status(500).send({
        message: "Error assigning TA",
      });
    }
  }

  exports.getClassDetails = async (req, res, next) => {
    const { classID } = req.params;
    const classObj = await Classes.findById(classID);
    console.log(classID)
    if (!classObj) {
      return res.status(400).send({ message: "Class does not exist!" });
    }

    const classDetails = await Classes.findById(classID)
      .populate('studentList', 'fullName ERP')
      .populate('teacherIDs', 'fullName')
      .populate('TA', 'fullName ERP') 

    res.status(200).send({
      message: "Class details received successfully!",
      classDetails,
    });
  }
  
  //need to make getClassDetails for student only => it wont have eifnormation about all assigments, quizzes and submissions, etc.

  exports.enrollStudent = async (req, res, next) => {
    const { studentID, classID } = req.body;
    if (!studentID) {
      return res.status(400).send({ message: "Student ID is required!" });
    }
    if (!classID) {
      return res.status(400).send({ message: "Class ID is required!" });
    }
    var classObj = await Classes.findById(classID);
    if (!classObj) {
      return res.status(400).send({ message: "Class does not exist!" });
    }
    var student = await User.findById(studentID);
    if (!student) {
      return res.status(400).send({ message: "Student does not exist!" });
    }
    if (student.userType != "Student") {
      return res.status(400).send({ message: "User is not a student!" });
    }

    const attendance = await Attendance.findById(classObj.Attendance[0]);
    if (!attendance) {
      return res.status(400).send({ message: "Attendance does not exist!" });
    }
    if(classObj.studentList.includes(studentID)){
      return res.status(400).send({message: "Student already enrolled!"});
    }

    classObj.studentList.push(studentID);
    await classObj.save();

    attendance.sessions.forEach((session) => {
      session.attendance.push({
        studentID: student._id,
        present: true,
      });
    });

    await attendance.save();
    res.status(200).send({
      message: "Student enrolled successfully!",
      updatedClass: classObj,
      updatedAttendance: attendance,
    });
  }

  exports.uploadSyllabus = async (req, res, next) => {
    const {classID} = req.body.classID;
    if(!classID){
      return res.status(400).send({message: "Class ID is required!"});
    }
    var classObj = await Classes.findById(classID);
    if(!classObj){
      return res.status(400).send({message: "Class does not exist!"});
    }
    if(!req.body.syllabus) {
      return res.status(400).send({message: "Syllabus is required!"});
    }
    classObj.syllabus = req.body.syllabus;
    await classObj.save();
    res.status(200).send({
      message: "Syllabus uploaded successfully!",
      classObj
    })
  }





  