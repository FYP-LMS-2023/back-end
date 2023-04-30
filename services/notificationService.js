const { User } = require("../models/User.js");
const { Classes } = require("../models/Class.js");
const { ObjectId } = require("mongoose").Types;
const {
  Notification,
  createNotificationAnnouncement,
  createNotificationThreadReply,
} = require("../models/Notification");

exports.getUnreadNotifications = async (req, res, next) => {
  const user = await User.findById(req.user._id).populate({
    path: "notifications",
    match: { read: false },
  });

  if (!user) {
    return res.status(404).send("User not found");
  }

  const notifications = user.notifications.map((notification) => {
    const { link } = notification;
    let classID, announcementID, threadID, commentID, replyID;

    if (link.includes("/class/") && link.includes("/announcement/")) {
      [classID, announcementID] = link.split("/").slice(-2);
    } else if (
      link.includes("/thread/") &&
      link.includes("/comment/") &&
      link.includes("/reply/")
    ) {
      [threadID, commentID, replyID] = link.split("/").slice(-3);
    } else if (link.includes("/thread/") && link.includes("/comment/")) {
      [threadID, commentID] = link.split("/").slice(-2);
    } else if (link.includes("/thread/")) {
      threadID = link.split("/").pop();
    } else if (link.includes("/comment/")) {
      commentID = link.split("/").pop();
    }

    return {
      ...notification.toObject(),
      classID,
      announcementID,
      threadID,
      commentID,
      replyID,
    };
  }).sort((a, b) => b.datePosted - a.datePosted);

  res.status(200).send({
    message: "New & unread notifications",
    notifications,
    numberOfNotifications: notifications.length,
  });
};

exports.getReadNotifications = async (req, res, next) => {
  const user = await User.findById(req.user._id).populate({
    path: "notifications",
    match: { read: true },
  });

  if (!user) {
    return res.status(400).send({ message: "User does not exist!" });
  }

  const notifications = user.notifications.map((notification) => {
    const { link } = notification;
    let classID, announcementID, threadID, commentID, replyID;

    if (link.includes("/class/") && link.includes("/announcement/")) {
      [classID, announcementID] = link.split("/").slice(-2);
    } else if (
      link.includes("/thread/") &&
      link.includes("/comment/") &&
      link.includes("/reply/")
    ) {
      [threadID, commentID, replyID] = link.split("/").slice(-3);
    } else if (link.includes("/thread/") && link.includes("/comment/")) {
      [threadID, commentID] = link.split("/").slice(-2);
    } else if (link.includes("/thread/")) {
      threadID = link.split("/").pop();
    } else if (link.includes("/comment/")) {
      commentID = link.split("/").pop();
    }

    return {
      ...notification.toObject(),
      classID,
      announcementID,
      threadID,
      commentID,
      replyID,
    };
  });

  res.status(200).send({
    message: "Read notifications retrieved successfully!",
    notifications,
    numberOfNotifications: notifications.length,
  });
};

exports.toggleNotificationRead = async (req, res, next) => {
  const { id } = req.params;

  const testNot = await Notification.findById(id);
  if(!testNot) return res.status(404).send("Notification not found");

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(400).send({ message: "User does not exist!" });
  }

  if(!user.notifications.includes(id)) return res.status(404).send("Notification not found");

  const notification = await Notification.findById(id);

  notification.read = !notification.read;
  await notification.save();

  if (!notification) {
    return res.status(404).send("Notification not found and not updated");
  }

  res.status(200).send({
    message: "Notification marked as read",
    notification,
  });
};
