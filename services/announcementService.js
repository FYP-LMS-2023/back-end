const { Announcement, validateAnnouncement, validateAnnouncementUpdate } = require("../models/Announcement.js");

const { User } = require("../models/User.js");
const { Classes } = require("../models/Classes.js");


exports.createAnnouncement = async (req, res, next) => {
    var schema = {
      title: req.body.title,
      description: req.body.description,
      datePosted: Date.now(),
      postedBy: req.user._id,
    };

    const user = await User.findById(req.body.postedBy);
    const classA = await Classes.findByID(req.body.classID);

    if(!classA){
      return res.status(400).send({ message: "Class does not exist!" });
    }
  
    if (!user) {
      return res.status(400).send({ message: "User does not exist!" });
    }

    if(
      user.type !== 'Faculty' ||
      !classA.teacherIDs.some((teacherID) => 
        teacherID.toString().equals(req.user._id.toString())  
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
    if(req.user_id.toString() !== announcement.postedBy.toString() || req.user.type !== 'Faculty'){
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
    if(!req.body.classID) {
      return res.status(400).send({message: "Class ID is required!"});
    }
    const classA = await Classes.findById(req.body.classID);
    if(!classA){
      return res.status(400).send({message: "Class does not exist!"});
    }
    const announcements = await Announcement.find({_id: {$in: classA.announcements}})
      .populate("postedBy", "fullName ERP -_id");
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
    const announcement = await Announcement.findByID(announcementID);
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
  
  