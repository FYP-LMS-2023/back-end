const { Semester, validateSemester } = require("../models/Semester.js");
const { Channel, validateChannel } = require("../models/Channel.js");
const { Attendance } = require("../models/Attendance.js");
const { Announcement } = require("../models/Announcement.js");

const cloudinary = require("cloudinary").v2;

const {
  Assignment,
  validateAssignment,
  validateAssignmentUpdate,
} = require("../models/AssignmentTwo.js");

const { User } = require("../models/User.js");
const { Classes } = require("../models/Class.js");
const mongoose = require("mongoose");
const moment = require("moment");

const {
  AssignmentSubmission,
  validateAssignmentSubmission,
} = require("../models/AssignmentSubmission.js");

exports.createAssignment = async function (req, res) {
  // console.log(req.headers);
  // console.log("headers printed above");
  // console.log("break");
  // console.log("printing body");
  // console.log(req.body);
  // console.log("body printed above");
  //convert to valid mongoose id
  const classID = req.body.classID;

  if (!classID) {
    return res.status(400).send({ message: "Class ID is required!" });
  }

  const classA = await Classes.findById(classID);
  if (!classA) {
    return res.status(400).send({ message: "Invalid class ID!" });
  }
  const user = await User.findById(req.user._id);
  // if (!user) {
  //     return res.status(400).send({ message: "Invalid user ID!" });
  // }
  if (user.userType !== "Faculty") {
    return res.status(403).send({ message: "Access denied!" });
  }
  if (!classA.teacherIDs.includes(req.user._id)) {
    return res.status(403).send({ message: "Access denied! classteacher" });
  }
  //convert to year format
  var useDate = moment(req.body.dueDate, "DD-MM-YYYYTHH:mm:ss.SSS[Z]");

  // try {
  let fileDetails = [];
  if (req.files && req.files.length > 0) {
    // console.log(req.files);
    const files = req.files;
    // console.log("testing after shifting to variable");
    // console.log(files);

    let totalSize = 0;
    for (const file of files) {
      totalSize += file.size;
    }
    if (totalSize > 1024 * 1024 * 20) {
      return res
        .status(400)
        .send({ message: "Total file size should be less than 20MB!" });
    }

    fileDetails = files.map((file) => ({
      url: file.path,
      public_id: file.filename,
      format: file.format,
    }));
  }

  const assignment = new Assignment({
    title: req.body.title,
    description: req.body.description,
    dueDate: useDate,
    uploadDate: Date.now(),
    status: "active",
    marks: req.body.marks,
    files: fileDetails,
  });

  // const { error } = validateAssignment(assignment);
  // if (error) {
  //   return res.status(400).send({ message: error.details[0].message });
  // }

  const result = await assignment.save();
  if (!result) {
    return res.status(500).send({ message: "Something went wrong!" });
  }

  classA.Assignments.push(result._id);
  await classA.save();

  res.status(200).send({
    message: "Assignment created successfully!",
    assignment: result,
  });
  // } catch (ex) {
  //   console.log(ex);
  //   res.status(500).send({ message: "Something went wrong!" });
  // }
};

exports.getAssignmentFiles = async function (req, res, next) {
  const { id } = req.params;

  try {
    if (!id) {
      return res.status(400).send({ message: "Assignment ID is required!" });
    }
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(400).send({ message: "Invalid assignment ID!" });
    }
    const user = await User.findById(req.user._id);
    const classA = await Classes.findOne({ Assignments: id });
    if (!classA) {
      return res.status(400).send({ message: "Class not found" });
    }
    if (
      !classA.studentList.includes(req.user._id) &&
      !classA.teacherIDs.includes(req.user._id)
    ) {
      return res.status(403).send({
        message: "Access denied! => You are not a part of this class",
      });
    }
    res.status(200).send({
      message: "Assignment files fetched successfully!",
      files: assignment.files,
    });
  } catch (ex) {
    console.log(ex);
    res.status(500).send({ message: "Something went wrong!" });
  }
};

exports.submitAssignment = async function (req, res) {
  const { id } = req.params;

  // Check if submissionDescription is provided and not empty
  if (req.body.submissionDescription) {
    const submissionDescription = req.body.submissionDescription.trim();
    if (submissionDescription.length === 0) {
      return res
        .status(400)
        .send({ message: "Description, if provided, cannot be empty" });
    }
  }

  if (!id) {
    return res.status(400).send({ message: "Assignment ID is required!" });
  }

  const assignment = await Assignment.findById(id);
  if (!assignment) {
    return res.status(400).send({ message: "Invalid assignment ID!" });
  }

  const user = await User.findById(req.user._id);
  const classA = await Classes.findOne({ Assignments: id });
  if (!classA) {
    return res.status(400).send({ message: "Class not found" });
  }

  if (!classA.studentList.includes(req.user._id)) {
    return res
      .status(403)
      .send({ message: "Access denied! => You are not a part of this class" });
  }

  if (assignment.status !== "active") {
    return res
      .status(403)
      .send({ message: "Access denied! => Assignment is not active" });
  }

  const nowDate = Date.now();
  if (nowDate > assignment.dueDate) {
    return res
      .status(403)
      .send({ message: "Access denied! => Assignment deadline has passed" });
  }

  const existingSubmission = await AssignmentSubmission.findOne({
    studentID: req.user._id,
    _id: { $in: assignment.submissions },
  });

  if (existingSubmission) {
    return res.status(403).send({
      message:
        "Access denied! => You have already submitted this assignment. Please use the resubmitAssignment route to update your submission.",
    });
  }

  try {
    const files = req.files;
    let fileDetails = [];
    if (files && files.length > 0) {
      let totalSize = 0;
      for (const file of files) {
        totalSize += file.size;
      }
      if (totalSize > 1024 * 1024 * 20) {
        return res
          .status(400)
          .send({ message: "Total file size should be less than 20MB!" });
      }

      fileDetails = files.map((file) => ({
        url: file.path,
        public_id: file.filename,
        format: file.format,
      }));
    }

    const submission = new AssignmentSubmission({
      uploadDate: Date.now(),
      files: fileDetails,
      marksReceived: 0,
      submissionDescription: req.body?.submissionDescription,
      submissionNumber: 0,
      studentID: req.user._id,
    });

    const result = await submission.save();
    if (!result) {
      return res.status(500).send({ message: "Something went wrong!" });
    }

    assignment.submissions.push(result._id);
    await assignment.save();

    res.status(200).send({
      message: "Assignment submitted successfully!",
      submission: result,
    });
  } catch (ex) {
    console.log(ex);
    res
      .status(500)
      .send({ message: "Something went wrong! => Exception detected" });
  }
};

exports.resubmitAssignment = async function (req, res) {
  const { id } = req.params;
  if (!id) {
    return res
      .status(400)
      .send({ message: "Assignment Submission ID is required!" });
  }
  const submission = await AssignmentSubmission.findById(id);
  if (!submission) {
    return res
      .status(400)
      .send({ message: "Invalid assignment submission ID!" });
  }

  const assignment = await Assignment.findOne({ submissions: submission._id });
  if (!assignment) {
    return res
      .status(400)
      .send({ message: "Invalid assignment submission ID!" });
  }

  if (assignment.dueDate < Date.now()) {
    return res
      .status(403)
      .send({ message: "Access denied! => Assignment deadline has passed" });
  }

  const user = await User.findById(req.user._id);

  if (submission.studentID.toString() !== req.user._id.toString()) {
    return res.status(403).send({
      message: "Access denied! => You are not the owner of this submission",
    });
  }

  try {
    const files = req.files;
    let fileDetails = [];
    if (files && files.length > 0) {
      let totalSize = 0;
      for (const file of files) {
        totalSize += file.size;
      }
      if (totalSize > 1024 * 1024 * 20) {
        return res
          .status(400)
          .send({ message: "Total file size should be less than 20MB!" });
      }

      fileDetails = files.map((file) => ({
        url: file.path,
        public_id: file.filename,
        format: file.format,
      }));
    }

    // Find existing submissions and remove them from the assignment's submissions array

    // Create a new submission with updated fields

    submission.files = fileDetails;
    submission.submissionDescription =
      req.body?.submissionDescription || submission.submissionDescription;
    submission.uploadDate = Date.now();
    submission.submissionNumber += 1;

    const result = await submission.save();
    if (!result) {
      return res.status(500).send({ message: "Something went wrong!" });
    }

    // Add the new submission to the assignment's submissions array

    res.status(200).send({
      message: "Assignment resubmitted successfully!",
      submission: result,
    });
  } catch (ex) {
    console.log(ex);
    res
      .status(500)
      .send({ message: "Something went wrong! => Exception detected" });
  }
};

exports.getAssignment = async function (req, res, next) {
  const { id } = req.params;

  try {
    if (!id) {
      return res.status(400).send({ message: "Assignment ID is required!" });
    }
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(400).send({ message: "Invalid assignment ID!" });
    }
    const user = await User.findById(req.user._id);
    const classA = await Classes.findOne({ Assignments: id });
    if (!classA) {
      return res.status(400).send({ message: "Class not found" });
    }
    if (!classA.studentList.includes(req.user._id)) {
      return res.status(403).send({
        message: "Access denied! => You are not a part of this class",
      });
    }
    res.status(200).send({
      message: "Assignment fetched successfully!",
      assignment: assignment,
    });
  } catch (ex) {
    console.log(ex);
    res.status(500).send({ message: "Something went wrong!" });
  }
};

exports.getAssignmentSubmissions = async function (req, res) {
  const { id } = req.params;
  if (!id) {
    return res.status(400).send({ message: "Assignment ID is required!" });
  }
  const assignment = await Assignment.findById(id);
  if (!assignment) {
    return res.status(400).send({ message: "Invalid assignment ID!" });
  }
  const classA = await Classes.findOne({ Assignments: id });
  if (!classA) {
    return res.status(400).send({ message: "Class not found" });
  }

  if (!classA.teacherIDs.includes(req.user._id)) {
    return res.status(403).send({
      message: "Access denied! You are not a teacher of this class",
    });
  }

  try {
    const returnAssignment = await Assignment.findById(id).populate({
      path: "submissions",
      options: { sort: { uploadDate: -1 } }, // Sort by uploadDate in descending order
      populate: {
        path: "studentID",
        select: "fullName email ERP",
      },
    });

    if (!returnAssignment) {
      return res.status(400).send({ message: "Invalid assignment ID!" });
    }

    res.status(200).send({
      message: "Assignment submissions fetched successfully!",
      submissions: returnAssignment.submissions,
    });
  } catch (ex) {
    console.log(ex);
    res
      .status(500)
      .send({ message: "Something went wrong! Exception detected" });
  }
};

exports.gradeAssignmentSubmission = async function (req, res) {
  const { id } = req.params;
  if (!id) {
    return res.status(400).send({ message: "Submission ID is required!" });
  }
  var submission = await AssignmentSubmission.findById(id);
  if (!submission) {
    return res.status(400).send({ message: "Invalid submission ID!" });
  }
  if (!req.body.marksReceived) {
    return res.status(400).send({ message: "Marks received is required!" });
  }

  const assignment = await Assignment.findOne({ submissions: id });
  if (!assignment) {
    return res.status(400).send({ message: "Assignment not found" });
  }

  const classA = await Classes.findOne({ Assignments: assignment._id });
  if (!classA) {
    return res.status(400).send({ message: "Class not found" });
  }

  if (!classA.teacherIDs.includes(req.user._id)) {
    return res.status(403).send({
      message: "Access denied! => You are not a teacher of this class",
    });
  }

  if (!req.body.marksReceived) {
    return res
      .status(400)
      .send({ message: "You are supposed to grade the assignment" });
  }

  if (req.body.marksReceived > assignment.marks) {
    return res.status(400).send({
      message: "Marks received cannot be greater than the total marks",
    });
  }

  submission.marksReceived = req.body?.marksReceived;
  submission.returnDate = Date.now();
  submission.returnDescription = req.body?.returnDescription;
  submission.returned = true;

  await submission.save();
  res.status(200).send({
    message: "Assignment submission graded successfully!",
    submission: submission,
  });
};

exports.getAllClassAssignments = async function (req, res) {
  const { id } = req.params;
  if (!id) {
    return res.status(400).send({ message: "Class ID is required!" });
  }

  const classA = await Classes.findById(id);
  if (!classA) {
    return res.status(400).send({ message: "Invalid class ID!" });
  }

  if (
    !classA.teacherIDs.includes(req.user._id) &&
    !classA.studentList.includes(req.user._id)
  ) {
    return res.status(403).send({
      message: "Access denied! You are not a teacher or student of this class",
    });
  }

  try {
    const classData = await Classes.findById(id).populate({
      path: "Assignments",
      match: { deleteFlag: false },
      options: { sort: { uploadDate: -1 } },
    });
    if (!classData) {
      return res.status(400).send({ message: "Class not found" });
    }
    res.status(200).send({
      message: "Assignments fetched successfully!",
      assignments: classData.Assignments,
    });
  } catch (ex) {
    console.log(ex);
    res
      .status(500)
      .send({ message: "Something went wrong! Exception detected" });
  }
};

exports.getAssignmentById = async function (req, res) {
  const { id } = req.params;
  if (!id) {
    return res.status(400).send({ message: "Assignment ID is required!" });
  }

  const ass1 = await Assignment.findOne({ _id: id, deleteFlag: false });
  if (!ass1) {
    return res.status(400).send({ message: "Invalid assignment ID!" });
  }

  const classA = await Classes.findOne({ Assignments: id });
  if (!classA) {
    return res.status(400).send({ message: "Class not found" });
  }

  if (
    !classA.teacherIDs.includes(req.user._id) &&
    !classA.studentList.includes(req.user._id)
  ) {
    return res.status(403).send({
      message: "Access denied! You are not a teacher or student of this class",
    });
  }

  return res.status(200).send({
    message: "Assignment fetched successfully!",
    assignment: ass1,
  });
};

// exports.getAssignmentDetailsStudent = async function (req, res) {
//   const { id } = req.params;
//   if (!id) {
//     return res.status(400).send({ message: "Assignment ID is required!" });
//   }

//   const ass1 = await Assignment.findById(id);
//   if (!ass1) {
//     return res.status(400).send({ message: "Invalid assignment ID!" });
//   }

//   const classA = await Classes.findOne({ Assignments: id });
//   if (!classA) {
//     return res.status(400).send({ message: "Class not found" });
//   }

//   if (!classA.studentList.includes(req.user._id)) {
//     return res.status(403).send({
//       message: "Access denied! => You are not a student of this class",
//     });
//   }

//   const ass2 = await Assignment.findById(id).populate("submissions");

//   for (let submission of ass2.submissions) {
//     if (submission.studentID == req.user._id) {
//       isSubmitted = true;
//       break;
//     }
//   }

//   res.status(200).send({
//     message: "Assignment details fetched successfully!",
//     assignment: ass1,
//     isSubmitted: isSubmitted,
//   });
// };

exports.getAssignmentDetailsStudent = async function (req, res) {
  const { id } = req.params;
  if (!id) {
    return res.status(400).send({ message: "Assignment ID is required!" });
  }

  const assignment = await Assignment.findById(id);
  if (!assignment) {
    return res.status(400).send({ message: "Invalid assignment ID!" });
  }

  const classA = await Classes.findOne({ Assignments: id });
  if (!classA) {
    return res.status(400).send({ message: "Class not found" });
  }

  if (!classA.studentList.includes(req.user._id)) {
    return res.status(403).send({
      message: "Access denied! You are not a student of this class",
    });
  }

  const submission = await AssignmentSubmission.findOne({
    studentID: req.user._id,
    _id: { $in: assignment.submissions },
  });

  if (submission) {
    var isSubmitted = true;
  }

  res.status(200).send({
    message: "Assignment details fetched successfully!",
    assignment: assignment,
    mySubmission: submission || null,
    isSubmitted: isSubmitted || false,
  });
};

exports.updateAssignment = async function (req, res) {
  const { id } = req.params;

  //chek to see if only {} is sent in body
  if (Object.keys(req.body).length === 0) {
    return res.status(400).send({ message: "No data sent in body!" });
  }

  if (!id) {
    return res.status(400).send({ message: "Assignment ID is required!" });
  }

  const { error } = validateAssignmentUpdate(req.body);
  if (error) {
    return res.status(400).send({ message: error.details[0].message });
  }

  const assignment = await Assignment.findById(id);
  if (!assignment) {
    return res.status(400).send({ message: "Invalid assignment ID!" });
  }
  const classA = await Classes.findOne({ Assignments: id });
  if (!classA) {
    return res.status(400).send({ message: "Class not found" });
  }

  if (!classA.teacherIDs.includes(req.user._id)) {
    return res.status(403).send({
      message: "Access denied! => You are not a teacher of this class",
    });
  }

  if (req.body.dueDate) {
    if (req.body.dueDate < Date.now()) {
      return res
        .status(400)
        .send({ message: "Due date cannot be less than current date" });
    }
    assignment.dueDate = req.body.dueDate;
  }

  if (req.body.marks) {
    assignment.marks = req.body.marks;
  }

  if (req.body.description) {
    assignment.description = req.body.description;
  }

  if (req.body.title) {
    assignment.title = req.body.title;
  }

  if (req.body.status) {
    assignment.status = req.body.status;
  }

  await assignment.save();
  res.status(200).send({
    message: "Assignment updated successfully!",
    assignment: assignment,
  });
};

exports.removeFileByIndexFromAssignment = async function (req, res) {
  const { id } = req.params;
  const { index } = req.params;
  if (!id) {
    return res.status(400).send({ message: "Assignment ID is required!" });
  }
  if (!index) {
    return res.status(400).send({ message: "Index is required!" });
  }
  const assignment = await Assignment.findById(id);
  if (!assignment) {
    return res.status(400).send({ message: "Invalid assignment ID!" });
  }
  const classA = await Classes.findOne({ Assignments: id });
  if (!classA) {
    return res.status(400).send({ message: "Class not found" });
  }
  if (!classA.teacherIDs.includes(req.user._id)) {
    return res.status(403).send({
      message: "Access denied! => You are not a teacher of this class",
    });
  }
  if (index >= 0 && index < assignment.files.length) {
    const file = assignment.files[index];
    await cloudinary.uploader.destroy(file.public_id);
    assignment.files.splice(index, 1);
    await assignment.save();
    res.status(200).send({
      message: "File removed successfully!",
      assignment: assignment,
    });
  } else {
    return res.status(400).send({ message: "Invalid index!" });
  }
};

exports.addFileToAssignment = async function (req, res) {
  const { id } = req.params;
  if (!id) {
    return res.status(400).send({ message: "Assignment ID is required!" });
  }
  const assignment = await Assignment.findById(id);
  if (!assignment) {
    return res.status(400).send({ message: "Invalid assignment ID!" });
  }
  const classA = await Classes.findOne({ Assignments: id });
  if (!classA) {
    return res.status(400).send({ message: "Class not found" });
  }
  if (!classA.teacherIDs.includes(req.user._id)) {
    return res.status(403).send({
      message: "Access denied! => You are not a teacher of this class",
    });
  }
  // console.log(req.files);
  const files = req.files;
  // console.log(files);
  if (!req.files || req.files.length === 0) {
    return res.status(400).send({ message: "No file uploaded!" });
  }

  let totalSize = 0;
  for (const file of files) {
    totalSize += file.size;
  }
  if (totalSize > 1024 * 20 * 1024) {
    return res
      .status(400)
      .send({ message: "Total file size should be less than 20MB!" });
  }

  const fileDetails = files.map((file) => {
    return { url: file.path, public_id: file.filename };
  });
  assignment.files.push(...fileDetails);

  await assignment.save();
  res.status(200).send({
    message: "Files added successfully!",
    assignment: assignment,
  });
};

exports.setAssignmentDeleteFlag = async function (req, res) {
  const { id } = req.params;
  if (!id) {
    return res.status(400).send({ message: "Assignment ID is required!" });
  }

  const assignment = await Assignment.findById(id);
  if (!assignment) {
    return res.status(400).send({ message: "Invalid assignment ID!" });
  }

  const classA = await Classes.findOne({ Assignments: id });
  if (!classA) {
    return res.status(400).send({ message: "Class not found" });
  }
  if (!classA.teacherIDs.includes(req.user._id)) {
    return res.status(403).send({
      message: "Access denied! => You are not a teacher of this class",
    });
  }
  assignment.deleteFlag = !assignment.deleteFlag;
  await assignment.save();
  res.status(200).send({
    message: "Assignment deleted successfully!",
    assignment: assignment,
  });
};
