const { Resource, validateResource } = require("../models/Resource");
const { Assignment } = require("../models/AssignmentTwo.js");
const { User } = require("../models/User.js");
const { Classes } = require("../models/Class.js");
const cloudinary = require("cloudinary").v2;

exports.createResource = async (req, res, next) => {
  if (!req.body.classID) {
    return res.status(400).send("Class ID is required");
  }

  if (!req.body.title) {
    return res.status(400).send("Title is required");
  }

  const classA = await Classes.findById(req.body.classID);
  if (!classA) {
    return res.status(400).send("Invalid class ID");
  }
  if (!classA.teacherIDs.includes(req.user._id)) {
    return res.status(400).send("You are not the teacher of this class");
  }

  try {
    const files = req.files;
    if (!files || files.length == 0) {
      return res.status(400).send({ message: "No files uploaded!" });
    }

    let totalSize = 0;
    for (const file of files) {
      totalSize += file.size;
    }
    if (totalSize > 1024 * 1024 * 20) {
      return res
        .status(400)
        .send({ message: "Total file size should be less than 20MB!" });
    }

    const fileDetails = files.map((file) => {
      return {
        url: file.path,
        public_id: file.filename,
        format: file.format,
      };
    });

    const resource = new Resource({
      title: req.body.title,
      description: req.body?.description,
      uploadDate: Date.now(),
      files: fileDetails,
      uploadedBy: req.user._id,
    });

    const result = await resource.save();
    if (!result) {
      return res.status(500).send({ message: "Something went wrong!" });
    }

    classA.Resources.push(result._id);
    await classA.save();

    res.status(200).send({
      message: "Resource created successfully!",
      resource: result,
    });
  } catch (ex) {
    console.log(ex);
    res.status(500).send({ message: "Something went wrong!" });
  }
};

exports.deleteResource = async (req, res, next) => {
  if (!req.params.id) {
    return res.status(400).send("Resource ID is required");
  }
  const { id } = req.params;
  const resource = await Resource.findById(id);
  if (!resource) {
    return res.status(400).send("Invalid resource ID");
  }

  console.log(req.body);
  if (!req.body.classID) {
    return res.status(400).send("Class ID is required");
  }

  const classA = await Classes.findById(req.body.classID);
  if (!classA) {
    return res.status(400).send("Invalid class ID");
  }
  if (!classA.teacherIDs.includes(req.user._id)) {
    return res.status(400).send("You are not the teacher of this class");
  }

  if (!classA.Resources.includes(id)) {
    return res.status(400).send("Resource not found in class");
  }

  const resourceIndex = classA.Resources.findIndex(
    (resource) => resource.toString() === id
  );
  if (resourceIndex === -1) {
    return res.status(400).send("Resource not found in class");
  }
  try {
    classA.Resources.splice(resourceIndex, 1);
    await classA.save();
    res.status(200).send({ message: "Resource deleted successfully!" });
  } catch (ex) {
    console.log(ex);
    res.status(500).send({ message: "Something went wrong!" });
  }
};

exports.getResourceByID = async (req, res, next) => {
  if (!req.params.id) {
    return res.status(400).send("Resource ID is required");
  }
  const { id } = req.params;
  const resource = await Resource.findById(id).populate({
    path: "uploadedBy",
    select: "fullName email profilePic",
  });
  if (!resource) {
    return res.status(400).send("Invalid resource ID");
  }
  res.status(200).send(resource);
};

exports.getClassResources = async (req, res, next) => {
  if (!req.params.id) {
    return res.status(400).send("Class ID is required");
  }

  const { id } = req.params;
  const classObj = await Classes.findById(id).populate({
    path: "Resources",
    populate: {
      path: "uploadedBy",
      model: "User",
      select: "fullName email",
    },
    options: { sort: { uploadDate: -1 } },
  });
  if (!classObj) {
    return res.status(400).send("Invalid class ID");
  }

  if (
    !classObj.studentList.includes(req.user._id) &&
    !classObj.teacherIDs.includes(req.user._id)
  ) {
    return res.status(400).send("You are not a member of this class");
  }

  res.status(200).send(classObj.Resources);
};

exports.updateResource = async (req, res, next) => {
  if (!req.params.id) {
    return res.status(400).send("Resource ID is required");
  }
  const { id } = req.params;
  const resource = await Resource.findById(id);
  if (!resource) {
    return res.status(400).send("Invalid resource ID");
  }
  if (!req.body.title && !req.body.description) {
    return res.status(400).send("No fields to update");
  }
  const classA = await Classes.findOne({ Resources: id });
  if (!classA) {
    return res.status(400).send("Resource not found in any class");
  }
  if (!classA.teacherIDs.includes(req.user._id)) {
    return res.status(400).send("You are not the teacher of this class");
  }
  if (!classA.Resources.includes(id)) {
    return res.status(400).send("Resource not found in class");
  }
  try {
    if (req.body.title) {
      resource.title = req.body.title;
    }
    if (req.body.description) {
      resource.description = req.body.description;
    }
    const result = await resource.save();
    if (!result) {
      return res.status(500).send({ message: "Something went wrong!" });
    }
    res
      .status(200)
      .send({ message: "Resource updated successfully!", resource: result });
  } catch (ex) {
    console.log(ex);
    res.status(500).send({ message: "Something went wrong!" });
  }
};

exports.removeFileByIndexFromResource = async (req, res, next) => {
  const { id } = req.params;
  const { index } = req.params;

  if (!id) {
    return res.status(400).send("Resource ID is required");
  }

  if (!index) {
    return res.status(400).send("Index is required");
  }

  const resource = await Resource.findById(id);

  if (!resource) {
    return res.status(400).send("Invalid resource ID");
  }
  const classA = await Classes.findOne({ Resources: id });
  if (!classA) {
    return res.status(400).send("Resource not found in any class");
  }
  if (!classA.teacherIDs.includes(req.user._id)) {
    return res.status(400).send("You are not the teacher of this class");
  }
  if (!classA.Resources.includes(id)) {
    return res.status(400).send("Resource not found in class");
  }
  try {
    if (index >= 0 && index < resource.files.length) {
      const file = resource.files[index];
      await cloudinary.uploader.destroy(file.public_id);
      resource.files.splice(index, 1);
      await resource.save();
      res
        .status(200)
        .send({ message: "File deleted successfully!", resource: resource });
    } else {
      res.status(400).send("Invalid index");
    }
  } catch (ex) {
    console.log(ex);
    res.status(500).send({ message: "Something went wrong!" });
  }
};

exports.addFileToResource = async (req, res, next) => {
  if (!req.params.id) {
    return res.status(400).send("Resource ID is required");
  }
  const { id } = req.params;
  const resource = await Resource.findById(id);
  if (!resource) {
    return res.status(400).send("Invalid resource ID");
  }
  const classA = await Classes.findOne({ Resources: id });
  if (!classA) {
    return res.status(400).send("Resource not found in any class");
  }
  if (!classA.teacherIDs.includes(req.user._id)) {
    return res.status(400).send("You are not the teacher of this class");
  }

  try {
    const files = req.files;
    if (!files || files.length == 0) {
      return res.status(400).send("No files uploaded");
    }

    let totalSize = 0;
    for (const file of files) {
      totalSize += file.size;
    }

    if (totalSize > 1024 * 1024 * 20) {
      return res.status(400).send("Total file size should be less than 20MB");
    }

    const fileDetails = files.map((file) => {
      return {
        url: file.path,
        public_id: file.filename,
        format: file.format,
      };
    });

    resource.files.push(...fileDetails);

    await resource.save();
    res.status(200).send({
      message: "Files added successfully!",
      resource: resource,
    });
  } catch (ex) {
    console.log(ex);
    res.status(500).send({ message: "Something went wrong!" });
  }
};
