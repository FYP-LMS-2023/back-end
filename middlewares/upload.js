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
    format: async (req, file) => {
      const ext = path.extname(file.originalname).substring(1);
      return ['jpg', 'jpeg', 'png'].includes(ext) ? ext : undefined;
    },
    public_id: (req, file) => `${Date.now()}-${file.originalname}`
  },
});

const storageSubmission = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'submissions',
    format: async (req, file) => {
      const ext = path.extname(file.originalname).substring(1);
      return ['jpg', 'jpeg', 'png'].includes(ext) ? ext : undefined;
    },
    public_id: (req, file) => `${Date.now()}-${file.originalname}`
  },
});

const fileFilter = (req, file, cb) => {
  //allow for png and jpeg submissions as well

  //handle .docx file as well


  if (file.mimetype === 'application/pdf' || file.mimetype === 'application/msword' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.mimetype === 'application/vnd.ms-excel' || file.mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' || file.mimetype === 'application/vnd.ms-powerpoint' || file.mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.slideshow' || file.mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.template') {
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