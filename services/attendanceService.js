const { Attendance, validateAttendance } = require("../models/Attendance.js");
const { Classes } = require("../models/Class.js");
const moment = require("moment");


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

  