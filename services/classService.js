const { Classes } = require("../models/Class.js");
const { Semester, validateSemester } = require("../models/Semester.js");
const { Channel, validateChannel } = require("../models/Channel.js");
const { User } = require("../models/User.js");
const { Attendance } = require("../models/Attendance.js");
const { Announcement } = require("../models/Announcement.js");
const mongoose = require("mongoose");

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
  };

  const { errorChannel } = validateChannel(schema, res);

  if (errorChannel) {
    console.log("validation error");
    return res.status(400).send({ message: `${error.details[0].message}` });
  }

  let channel = new Channel(schema);
  const channelSave = await channel.save();

  if (!channelSave) {
    return res.status(500).send({ message: "Error creating channel!" });
  }

  var schema2 = {
    semesterID: req.body.semesterID,
    Attendance: [],
    studentList: [],
    Assignments: [],
    syllabus: req.body?.syllabus,
    Quizzes: [],
    TA: [],
    Channel: channelSave._id,
    Announcement: [],
    Resources: [],
    startDate: req.body.startDate,
  };

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
  if (!req.body.classID) {
    return res.status(400).send({ message: "Class ID is required!" });
  }
  if (!req.body.teacherID) {
    return res.status(400).send({ message: "Teacher ID is required!" });
  }
  var classObj = await Classes.findById(req.body.classID);
  if (!classObj) {
    return res.status(400).send({ message: "Class does not exist!" });
  }
  var teacher = await User.findById(req.body.teacherID);
  if (!teacher) {
    return res.status(400).send({ message: "Teacher does not exist!" });
  }
  if (teacher.userType != "Faculty") {
    return res.status(400).send({ message: "User is not a teacher!" });
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
};

exports.assignTA = async (req, res, next) => {
  if (!req.body.classID) {
    return res.status(400).send({ message: "Class ID is required!" });
  }
  if (!req.body.taID) {
    return res.status(400).send({ message: "TA ID is required!" });
  }
  var classObj = await Classes.findById(req.body.classID);
  if (!classObj) {
    return res.status(400).send({ message: "Class does not exist!" });
  }
  var student = await User.findById(req.body.taID);
  if (!student) {
    return res.status(400).send({ message: "Student does not exist!" });
  }
  if (student.userType != "Student") {
    return res.status(400).send({ message: "User is not a student!" });
  }
  if (classObj.TA.includes(req.body.taID)) {
    return res.status(400).send({ message: "Student already assigned!" });
  }
  if (classObj.TA.length >= 1) {
    return res
      .status(400)
      .send({
        message: "TA already assigned to class!",
      });
  }
  if (classObj.studentList.includes(req.body.taID)) {
    return res
      .status(400)
      .send({
        message: "Student is enrolled in class, thus cannot be assigned TA!",
      });
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
};

exports.getClassDetails = async (req, res, next) => {
  const { classID } = req.params;
  const classObj = await Classes.findById(classID);
  console.log(classID);
  if (!classObj) {
    return res.status(400).send({ message: "Class does not exist!" });
  }

  const classDetails = await Classes.findById(classID)
    .populate("studentList", "fullName ERP")
    .populate("teacherIDs", "fullName")
    .populate("TA", "fullName ERP");

  res.status(200).send({
    message: "Class details received successfully!",
    classDetails,
  });
};

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

  const admin = await User.findById(req.user._id);
  if (!admin) {
    return res.status(400).send({ message: "Admin does not exist!" });
  }

  if (admin.userType !== "Admin") {
    return res.status(400).send({ message: "User is not an admin!" });
  }

  const attendance = await Attendance.findById(classObj.Attendance[0]);
  if (!attendance) {
    return res.status(400).send({ message: "Attendance does not exist!" });
  }
  if (classObj.studentList.includes(studentID)) {
    return res.status(400).send({ message: "Student already enrolled!" });
  }
  if (classObj.TA.includes(studentID)) {
    return res.status(400).send({ message: "Student is TA of Class thus cannot be enrolled!" });
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
};

exports.uploadSyllabus = async (req, res, next) => {
  const classID = req.body.classID;
  if (!classID) {
    return res.status(400).send({ message: "Class ID is required!" });
  }
  if (!mongoose.Types.ObjectId.isValid(classID)) {
    return res.status(400).send({ message: "Invalid Class ID!" });
  }
  var classObj = await Classes.findById(classID);
  if (!classObj) {
    return res.status(400).send({ message: "Class does not exist!" });
  }
  if (!req.body.syllabus) {
    return res.status(400).send({ message: "Syllabus is required!" });
  }
  if (!classObj.teacherIDs.includes(req.user._id)) {
    return res
      .status(400)
      .send({ message: "User is not a teacher of this class!" });
  }

  classObj.syllabus = req.body.syllabus;
  await classObj.save();
  res.status(200).send({
    message: "Syllabus uploaded successfully!",
    classObj,
  });
};

exports.getMyActiveClasses = async (req, res, next) => {
  const studentID = req.user._id;

  if (!studentID) {
    return res.status(400).send({ message: "Student ID is required!" });
  }
  const student = await User.findById(studentID);
  if (!student || student.userType != "Student") {
    return res.status(400).send({ message: "Student does not exist!" });
  }
  const currentDate = new Date();

  const activeSemester = await Semester.findOne({
    //semesterStartDate: { $lte: currentDate },
    semesterEndDate: { $gte: currentDate },
  });
  if (!activeSemester) {
    return res.status(400).send({ message: "No active semester!" });
  }

  const enrolledClasses = await Classes.find({ studentList: studentID })
    .select("-studentList")
    //.populate('studentList', 'fullName ERP')
    .populate("teacherIDs", "fullName")
    .populate("TA", "fullName ERP");

  //console.log(enrolledClasses);

  if (!enrolledClasses) {
    return res.status(400).send({ message: "No enrolled classes!" });
  }
  const activeClasses = enrolledClasses.filter((classObj) => {
    return classObj.semesterID.toString() == activeSemester._id.toString();
  });

  const activeClassesWithCourseDetails = await Promise.all(
    activeClasses.map(async (classObj) => {
      const course = await Course.findOne({ classes: classObj._id });
      return {
        ...classObj.toObject(),
        courseName: course.courseName,
        courseCode: course.courseCode,
      };
    })
  );

  res.status(200).send({
    message: "Active classes received successfully!",
    activeClasses: activeClassesWithCourseDetails,
  });
};

exports.getClassDetailsShaheer = async (req, res, next) => {
  const classID = req.body.classID;
  if (!classID) {
    return res.status(400).send({ message: "Class ID is required!" });
  }

  try {
    const classDetails = await Classes.findById(classID)
      .populate({
        path: "studentList",
        select: "fullName ERP email profilePic",
      })
      .populate({
        path: "teacherIDs",
        select: "fullName email profilePic",
      })
      .populate({
        path: "TA",
        select: "fullName ERP email profilePic",
      })
      .populate({
        path: "Assignments",
        match: { deleteFlag: false },
        options: { sort: { uploadDate: -1 }, limit: 1 },
      })
      .populate({
        path: "Announcement",
        options: { sort: { datePosted: -1 }, limit: 1 },
        populate: {
          path: "postedBy",
          select: "fullName ERP profilePic",
        },
      });

    if (!classDetails) {
      return res.status(400).send({ message: "Class does not exist!" });
    }

    const courseDetails = await Course.findOne({ classes: classID }).select(
      "courseName courseCode courseDescription creditHours"
    );
    if (!courseDetails) {
      return res.status(400).send({ message: "Course does not exist!" });
    }

    const channelDetails = await Channel.findById(
      classDetails.Channel
    ).populate({
      path: "threads",
      options: { sort: { datePosted: -1 }, limit: 1 },
      populate: {
        path: "postedBy",
        select: "fullName ERP email profilePic",
      },
    });

    if (!channelDetails) {
      return res.status(400).send({ message: "Channel does not exist!" });
    }

    let latestThreads =
      channelDetails && channelDetails.threads ? channelDetails.threads : [];

    // latest assignment and announcement from the classDetails
    let latestAssignment = classDetails.Assignments[0];
    let latestAnnouncement = classDetails.Announcement[0];

    res.status(200).send({
      message: "Class details received successfully!",
      //classID: classID,
      classDetails: {
        course: courseDetails,
        teacher: classDetails.teacherIDs[0],
        class: {
          student_list: classDetails.studentList,
          TA: classDetails.TA,
          numberOfStudents: classDetails.studentList.length,
          syllabus: classDetails.syllabus,
        },
      },
      channel: {
        latestThreads: latestThreads,
        channelID: classDetails.Channel,
      },
      latestAnnouncement: latestAnnouncement,
      latestAssignment: latestAssignment,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error!" });
  }
};

exports.getActiveClassesForTeacher = async (req, res, next) => {
  const teacherID = req.user._id;

  // if(!teacherID){
  //   return res.status(400).send({message: "Teacher ID is required!"});
  // }

  const teacher = await User.findById(teacherID);

  if (!teacher || teacher.userType != "Faculty") {
    return res.status(400).send({ message: "Teacher does not exist!" });
  }

  const currentDate = new Date();

  const activeSemester = await Semester.findOne({
    //semesterStartDate: { $lte: currentDate },
    semesterEndDate: { $gte: currentDate },
  });

  if (!activeSemester) {
    return res.status(400).send({ message: "No active semester!" });
  }

  const teachingClasses = await Classes.find({ teacherIDs: teacherID })
    .select("-studentList")
    //.populate('studentList', 'fullName ERP')
    .populate("teacherIDs", "fullName")
    .populate("TA", "fullName ERP");

  if (!teachingClasses) {
    return res.status(400).send({ message: "No teaching classes!" });
  }

  const activeClasses = teachingClasses.filter((classObj) => {
    return classObj.semesterID.toString() == activeSemester._id.toString();
  });

  const activeClassesWithCourseDetails = await Promise.all(
    activeClasses.map(async (classObj) => {
      const course = await Course.findOne({ classes: classObj._id });
      return {
        ...classObj.toObject(),
        courseName: course.courseName,
        courseCode: course.courseCode,
        //teachingClasses: teachingClasses,
      };
    })
  );

  res.status(200).send({
    message: "Active classes received successfully!",
    activeClasses: activeClassesWithCourseDetails,
  });
};

exports.testClass = async (req, res, next) => {
  const classes = await Classes.find({
    studentList: req.user._id,
  });

  res.status(200).send({
    message: "Classes received successfully!",
    classes,
  });
};

exports.getAllClasses = async (req, res, next) => {
  const classes = await Classes.find()
    .populate({
      path: "semesterID",
      select: "semesterName",
    })
    .populate({
      path: "teacherIDs",
      select: "ERP fullName",
    })
    .populate({
      path: "TA",
      select: "ERP fullName",
    });

  for (var i = 0; i < classes.length; i++) {
    const course = await Course.findOne({
      classes: `${classes[i]._id}`,
    }).select("courseName");

    let x = { class: classes[i], course: course };
    classes[i] = x;
  }

  return res.json(classes);
};
