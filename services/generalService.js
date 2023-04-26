const { Classes } = require("../models/Class.js");
const { Semester, validateSemester } = require("../models/Semester.js");
const { Channel, validateChannel } = require("../models/Channel.js");
const { User } = require("../models/User.js");
const { Attendance } = require("../models/Attendance.js");
const { Announcement } = require("../models/Announcement.js");



const {
  Course,
  validateCourse,
  validateCourseUpdate,
} = require("../models/Course.js");


exports.getMainDashboard = async (req, res, next) => {
  const studentID = req.user._id;
  const currentDate = new Date();
  const activeSemester = await Semester.findOne({
    //semesterStartDate: { $lte: currentDate },
    semesterEndDate: { $gte: currentDate },
  })
  if(!activeSemester){
    return res.status(400).send({message: "No active semester!"});
  }
  const enrolledClasses = await Classes.find({studentList: studentID})
    .populate('studentList', 'fullName ERP')
    .populate('teacherIDs', 'fullName')
    .populate('TA', 'fullName ERP')
    .select('-__v -Quizzes -Quizes -Resources')
  
  if(!enrolledClasses){
    return res.status(400).send({message: "No enrolled classes!"});
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

  const classesWithAnnouncements = activeClassesWithCourseDetails.filter(
    (classObj) => classObj.Announcement.length > 0
  );

  const populatedClasses = await Promise.all(
    classesWithAnnouncements.map(async (classObj) => {
      return await Classes.findById(classObj._id).populate({
        path: "Announcement",
        populate: { path: "postedBy", select: "fullName ERP -_id profilePic" },
      });
    })
  );

  const sortedAnnouncements = populatedClasses.
    flatMap((classObj) => classObj.Announcement || [])
    .sort((a, b) => b.datePosted - a.datePosted)
    .slice(0, 5);

  res.send({
    announcements: sortedAnnouncements,
    activeClasses: activeClassesWithCourseDetails,
  })
}