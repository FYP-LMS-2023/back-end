const { Semester, validateSemester } = require("../models/Semester.js");
const { Channel, validateChannel } = require("../models/Channel.js");
const { Attendance } = require("../models/Attendance.js");
const { Announcement } = require("../models/Announcement.js");

const { Assignment } = require("../models/AssignmentTwo.js");
const { User } = require("../models/User.js");
const { Classes } = require("../models/Class.js");

const mongoose = require("mongoose");
const moment = require("moment");



exports.createAssignment = async function (req, res) {

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

    try{
        const files = req.files;
        if (!files || files.length == 0) {
            return res.status(400).send({ message: "No files uploaded!" });
        }

        let totalSize = 0;
        for (const file of files) {
            totalSize += file.size;
        }
        if (totalSize > 1024*1024*20) {
            return res.status(400).send({ message: "Total file size should be less than 20MB!" });
        }

        const fileDetails = files.map(file => ({
            url: file.path,
            public_id: file.filename,
            format: file.format
        }))

        const assignment = new Assignment({
            title: req.body.title,
            description: req.body.description,
            dueDate: useDate,
            uploadDate: Date.now(),
            status: "active",
            marks: req.body.marks,
            files: fileDetails
        });

        const result = await assignment.save();
        if (!result) {
            return res.status(500).send({ message: "Something went wrong!" });
        }

        classA.Assignments.push(result._id);
        await classA.save();

        res.status(200).send({
            message: "Assignment created successfully!",
            assignment: result
        })

    } catch (ex) {
        console.log(ex);
        res.status(500).send({ message: "Something went wrong!" });
    }
}

exports.getAssignmentFiles = async function (req, res, next) {
    const {id} = req.params;

    try {
        if (!id) {
            return res.status(400).send({ message: "Assignment ID is required!" });
        }
        const assignment = await Assignment.findById(id);
        if (!assignment) {
            return res.status(400).send({ message: "Invalid assignment ID!" });
        }
        const user = await User.findById(req.user._id);
        const classA  = await Classes.findOne({Assignments: id});
        if (!classA) {
            return res.status(400).send({ message: "Class not found" });
        }
        if (!classA.studentList.includes(req.user._id)) {
            return res.status(403).send({ message: "Access denied! => You are not a part of this class" });
        }
        res.status(200).send({
            message: "Assignment files fetched successfully!",
            files: assignment.files
        });
    } catch (ex) {
        console.log(ex);
        res.status(500).send({ message: "Something went wrong!" });
    }
}