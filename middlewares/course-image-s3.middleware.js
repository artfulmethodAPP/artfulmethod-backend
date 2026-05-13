const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");
const { randomUUID } = require("crypto");
const s3 = require("../config/s3.config");

const ALLOWED_IMAGE_MIMETYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

const courseImageUploadS3 = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
      const filename = `courses/artwork/${randomUUID()}${ext}`;
      cb(null, filename);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (ALLOWED_IMAGE_MIMETYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp, svg)"));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

module.exports = courseImageUploadS3;
