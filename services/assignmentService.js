const { Assignment, validateAssignment } = require("../models/Assignment");

exports.createAssignment = async (req, res, next) => {
//   console.log(req.body);
//   console.log(req.file);
  const assignmentSchema = {
    uploadDate: Date.now(),
    dueDate: req.body?.dueDate,
    title: req.body?.title,
    classId: req.body?.classId,
    resubmissionsAllowed: req.body?.resubmissionsAllowed,
    status: req.body?.status,
    resubmissionDeadline: req.body?.resubmissionDeadline,
    description: req.body?.description,

    filename: req.file?.filename,
    filePath: req.file?.path,
    fileSize: req.file?.size,
    fileType: req.file?.mimetype,

    submissions: [],
    marks: req.body?.marks,
  };

  const { error } = validateAssignment(assignmentSchema);
  if (error)
    return res.status(400).send({ message: `${error.details[0].message}` });

  let assignment = new Assignment(assignmentSchema);

  const result = await assignment.save();

  res.json(result);
};
