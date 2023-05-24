const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const path = require("path");
const multer = require("multer");

// Configure Cloudinary
// console.log(
//   process.env.CLOUDINARY_CLOUD_NAME,
//   process.env.CLOUDINARY_API_KEY,
//   process.env.CLOUDINARY_API_SECRET
// );
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storageAssignment = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const ext = path.extname(file.originalname).substring(1);
    const isImage = ["jpg", "jpeg", "png"].includes(ext);
    return {
      folder: "assignments",
      format: isImage ? ext : undefined,
      public_id: `${Date.now()}-${file.originalname}`,
      resource_type: isImage ? "image" : "raw",
    };
  },
});

const storageProfilePicture = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const ext = path.extname(file.originalname).substring(1);
    const isImage = ["jpg", "jpeg", "png"].includes(ext);
    return {
      folder: "profile_pictures",
      format: isImage ? ext : undefined,
      public_id: `${Date.now()}-${file.originalname}`,
      resource_type: isImage ? "image" : "raw",
    };
  },
});

const storageSubmission = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const ext = path.extname(file.originalname).substring(1);
    const isImage = ["jpg", "jpeg", "png"].includes(ext);
    return {
      folder: "submissions",
      format: isImage ? ext : undefined,
      public_id: `${Date.now()}-${file.originalname}`,
      resource_type: isImage ? "image" : "raw",
    };
  },
});

const storageResource = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const ext = path.extname(file.originalname).substring(1);
    const isImage = ["jpg", "jpeg", "png"].includes(ext);
    return {
      folder: "resources",
      format: isImage ? ext : undefined,
      public_id: `${Date.now()}-${file.originalname}`,
      resource_type: isImage ? "image" : "raw",
    };
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "application/pdf" ||
    file.mimetype === "application/msword" ||
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file.mimetype === "application/vnd.ms-excel" ||
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
    file.mimetype === "application/vnd.ms-powerpoint" ||
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.presentationml.slideshow" ||
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.presentationml.template" ||
    file.mimetype === "application/zip" ||
    file.mimetype === "application/x-zip-compressed" ||
    file.mimetype === "application/x-rar-compressed" ||
    file.mimetype === "application/octet-stream" ||
    file.mimetype === "application/x-zip" ||
    file.mimetype === "application/x-rar" ||
    file.mimetype === "application/x-7z-compressed" ||
    file.mimetype === "application/txt"
  ) {
    cb(null, true);
  } else {
    cb({ message: "Unsupported file format!" }, false);
  }
};

const fileFilterProfilePicture = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb({ message: "Unsupported file format!" }, false);
  }
};

const uploadProfilePicture = multer({
  storage: storageProfilePicture,
  limits: {
    fileSize: 1024 * 1024 * 3, // 3 MB
    fieledSize: 1024,
  },
  fileFilter: fileFilterProfilePicture,
});

const uploadResource = multer({
  storage: storageResource,
  limits: {
    fileSize: 1024 * 1024 * 20, // 20 MB
    fieledSize: 1024,
  },
  fileFilter: fileFilter,
});

const uploadAssignment = multer({
  storage: storageAssignment,
  limits: {
    fileSize: 1024 * 1024 * 20, // 20 MB
    fieledSize: 1024,
  },
  fileFilter: fileFilter,
});

const uploadSubmission = multer({
  storage: storageSubmission,
  limits: {
    fileSize: 1024 * 1024 * 20, // 20 MB
    fieledSize: 1024,
  },
  fileFilter: fileFilter,
});

module.exports = {
  uploadAssignment,
  uploadSubmission,
  uploadResource,
  uploadProfilePicture,
};
