const { Announcement, validateAnnouncement, validateAnnouncementUpdate } = require("../models/Announcement.js");

const { User } = require("../models/User.js");
const { Classes } = require("../models/Class.js");
const { ObjectId } = require("mongoose").Types;
const { Notification, createNotificationAnnouncement } = require("../models/Notification");
const { Course } = require("../models/Course.js");

exports.createAnnouncement = async (req, res, next) => {
    var schema = {
      title: req.body.title,
      description: req.body.description,
      datePosted: Date.now(),
      postedBy: req.user._id,
      announcementType: req.body.announcementType,
    };

    const user = await User.findById(req.user._id);
    const classA = await Classes.findById(req.body.classID);

    if(!classA.teacherIDs.includes(req.user._id)){
      return res.status(400).send({ message: "You are not authorized to post announcements!" });
    }

    if(!classA){
      return res.status(400).send({ message: "Class does not exist!" });
    }
  
    if (!user) {
      return res.status(400).send({ message: "User does not exist!" });
    }

    if(
      user.userType !== 'Faculty' ||
      !classA.teacherIDs.some((teacherID) => 
        teacherID.toString() === (req.user._id.toString())  
    )) {
      return res.status(400).send({ message: "You are not authorized to post announcements!" });
    }
  
    const { error } = validateAnnouncement(schema, res);
    if (error) {
      console.log("validation error");
      return res.status(400).send({ message: `${error.details[0].message}` });
    }
  
    let announcement = new Announcement(schema);
    const result = await announcement.save();
    classA.Announcement.push(announcement._id);
    await classA.save();

    const courseDetails = await Course.findOne({ classes: req.body.classID }).select('courseName courseCode ');
    if (!courseDetails) {
      return res.status(400).send({ message: "Course does not exist!" });
    }
    console.log(courseDetails.courseCode, courseDetails.courseName)
    
    await createNotificationAnnouncement(req.body.classID, result, courseDetails.courseCode, courseDetails.courseName );

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

  exports.updateAnnouncement = async (req, res, next) => {
    const announcementID = req.params.id;
    const {error} = validateAnnouncementUpdate(req.body);
    if(error){
      return res.status(400).send({message: `${error.details[0].message}`});
    }
    const announcement = await Announcement.findById(announcementID);
    if(!announcement){
      return res.status(400).send({message: "Announcement does not exist!"});
    }
    if(req.user._id.toString() !== announcement.postedBy.toString() || req.user.userType !== 'Faculty'){
      return res.status(400).send({message: "You are not authorized to update this announcement!"});
    }
    const result = await Announcement.findByIdAndUpdate(announcementID, req.body, {new: true});
    if(result){
      res.status(200).send({
        message: "Announcement updated successfully!",
        result,
      });
    }else{
      res.status(500).send({
        message: "Error updating announcement",
      });
    } 
  }

  exports.getAnnouncements = async (req, res, next) => {
    const {id} = req.params;

    if(!id) {
      return res.status(400).send({message: "Class ID is required!"});
    }
    const classA = await Classes.findById(id);
    if(!classA){
      return res.status(400).send({message: "Class does not exist!"});
    }
    const announcements = await Announcement.find({_id: {$in: classA.Announcement}})
      .populate("postedBy", "fullName ERP -_id")
      .sort({datePosted: -1});
    if(announcements){
      res.status(200).send({
        message: "Announcements fetched successfully!",
        announcements,
      });
    }else{
      res.status(500).send({
        message: "Error fetching announcements",
      });
    }
  }

  exports.getAnnouncement = async (req, res, next) => {
    const announcementID = req.params.id;
    if(!ObjectId.isValid(announcementID)){
      return res.status(400).send({message: "Invalid announcement ID!"});
    }
    const announcement = await Announcement.findById(announcementID)
      .populate("postedBy", "fullName ERP -_id");
    if(announcement){
      res.status(200).send({
        message: "Announcement fetched successfully!",
        announcement,
      });
    }else{
      res.status(500).send({
        message: "Error fetching announcement",
      });
    }
  }

  exports.deleteAnnouncement = async (req, res, next) => {
    const announcementID = req.params.id;
    const announcement = await Announcement.findById(announcementID);
    if (!announcement) {
      return res.status(400).send({ message: "Announcement does not exist!" });
    }
    if(req.user_id.toString() !== announcement.postedBy.toString() || req.user.type !== 'Faculty') {
      return res.status(400).send({message: "You are not authorized to delete this announcement!"});
    }
    const result = await Announcement.findByIdAndDelete(announcementID);
    if(result){
      res.status(200).send({
        message: "Announcement deleted successfully!",
      });
    }else{
      res.status(500).send({
        message: "Error deleting announcement",
      });
    }
  }
  
  