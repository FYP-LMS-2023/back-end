const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const path = require("path");
const multer = require("multer");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storageAssignment = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'assignments',
    format: async (req, file) => path.extname(file.originalname).substring(1),
    public_id: (req, file) => `${Date.now()}-${file.originalname}`
  },
});

const storageSubmission = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'submissions',
    format: async (req, file) => path.extname(file.originalname).substring(1),
    public_id: (req, file) => `${Date.now()}-${file.originalname}`
  },
})

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || file.mimetype === 'application/msword' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    cb(null, true);
  } else {
    cb({ message: "Unsupported file format!"}, false)
  }
}

const uploadAssignment = multer({ 
  storage: storageAssignment,
  limits: { 
    fileSize: 1024 * 1024 * 20, // 20 MB
    fieledSize: 1024,

  }, 
  fileFilter: fileFilter
});

const uploadSubmission = multer({
  storage: storageSubmission,
  limits: {
    fileSize: 1024 * 1024 * 20, // 20 MB
    fieledSize: 1024,
  },
  fileFilter: fileFilter
})

module.exports = {
  uploadAssignment,
  uploadSubmission
}