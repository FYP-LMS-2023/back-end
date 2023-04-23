const { Attendance, validateAttendance } = require("../models/Attendance.js");
const { Classes } = require("../models/Class.js");
const moment = require("moment");
const { User } = require("../models/User.js");


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
  
    // console.log(sessions)
  
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
    const resultAttendance = await Attendance.findById(resultClass.Attendance[0])
    .populate("sessions.attendance.studentID", "fullName ERP")
    if (!resultAttendance) {
      return res.status(400).send({ message: "Attendance does not exist!" });
    }
  
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

  exports.getMyAttendanceOfClass = async (req, res, next) => {
    const {studentID, classID} = req.body;
    if (!classID) {
      return res.status(400).send({ message: "Class ID is required!" });
    }
    const resultClass = await Classes.findById(classID);
    if (!resultClass) {
      return res.status(400).send({ message: "Class does not exist!" });
    }
    const student = await User.findById(studentID);
    if (!student) {
      return res.status(400).send({ message: "Student does not exist!" });
    }

    const attendance = await Attendance.findById(resultClass.Attendance[0]);
    if (!attendance) {
      return res.status(400).send({ message: "Attendance does not exist!" });
    }
    const absentDays = attendance.sessions.filter((session) => {
      const studentAttendance = session.attendance.find(
        (entry) => entry.studentID.toString() === studentID.toString()
      );
      return studentAttendance && !studentAttendance.present; 
    })
    .map((session) => moment(session.date).format("DD/MM/YYYY"));

    res.status(200).send({
      message: "Attendance fetched successfully of Absent Days",
      absentDays,
      absentCount: absentDays.length,
    });
  }

  exports.getAttendanceBySession = async (req, res, next) => {
    const {classID, date, sessionNumber} = req.body;
    if (!classID) {
      return res.status(400).send({ message: "Class ID is required!" });
    }
    const classObj = await Classes.findById(classID);
    if (!classObj) {
      return res.status(400).send({ message: "Class does not exist!" });
    }
    if (!date && !sessionNumber) {
      return res.status(400).send({ message: "Date or Session Number is required!" });
    }
    const attendance = await Attendance.findById(classObj.Attendance[0]);
    if (!attendance) {
      return res.status(400).send({ message: "Attendance does not exist!" });
    }
    let session;
    console.log(date);
    if (date) {
      session = attendance.sessions.find(
        //(session) => moment(session.date).format("DD/MM/YYYY") === date);
        (session) => moment(session.date).format("YYYY-MM-DD") === moment(date).format("YYYY-MM-DD"));
    }
    else {
      session = attendance.sessions[sessionNumber-1];
    }
    console.log(session)


    if (!session) {
      return res.status(400).send({ message: "Session does not exist!" });
    }

    const populatedAttendance = await Promise.all (
      session.attendance.map(async (entry) => {
        const student = await User.findById(entry.studentID);
        return {
          studentName: student.fullName,
          ERP: student.ERP,
          present: entry.present,
        };
      })
    );

    res.status(200).send({
      message: "Session attendance fetched successfully!",
      sessionNumber: sessionNumber ? sessionNumber : attendance.sessions.indexOf(session) + 1,
      date: moment(session.date).format("DD/MM/YYYY"),
      dayOfWeek: moment(session.date).format("dddd"),
      attendance: populatedAttendance,
    });
  }

  exports.toggleAttendance = async (req, res, next) => {
    const {classID, date, sessionNumber, studentID} = req.body;
    if (!classID) {
      return res.status(400).send({ message: "Class ID is required!" });
    }
    const classObj = await Classes.findById(classID);
    if (!classObj) {
      return res.status(400).send({ message: "Class does not exist!" });
    }
    if (!date && !sessionNumber) {
      return res.status(400).send({ message: "Date or Session Number is required!" });
    }
    const attendance = await Attendance.findById(classObj.Attendance[0]);
    if (!attendance) {
      return res.status(400).send({ message: "Attendance does not exist!" });
    }
    const student = await User.findById(studentID);
    if (!student) {
      return res.status(400).send({ message: "Student does not exist!" });
    }
    let session;
    if (date) {
      session = attendance.sessions.find(
        (session) => moment(session.date).format("DD/MM/YYYY") === moment(date).format("DD/MM/YYYY"));
    }
    else {
      session = attendance.sessions[sessionNumber-1];
    }
    if (!session) {
      return res.status(400).send({ message: "Session does not exist!" });
    }
    const attendanceEntry = session.attendance.find(
      (entry) => entry.studentID.toString() === studentID.toString());
    if (!attendanceEntry) {
      return res.status(400).send({ message: "Attendance entry does not exist!" });
    }
    //attendance entry to see if the guy u r asking for attendance is enrolled in class or not
    attendanceEntry.present = !attendanceEntry.present;
    await attendance.save();

    res.status(200).send({
      message: "Attendance entry updated successfully!",
      sessionNumber: sessionNumber ? sessionNumber : attendance.sessions.indexOf(session) + 1,
      date: moment(session.date).format("DD/MM/YYYY"),
      studentID,
      fullName: student.fullName,
      ERP: student.ERP,
      present: attendanceEntry.present,
    })
  }


  
    



  