const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");
const { randomUUID } = require("crypto");
const s3 = require("../config/s3.config");

const ALLOWED_AUDIO_MIMETYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/mp4",
  "audio/m4a",
  "audio/x-m4a",
  "audio/ogg",
  "audio/webm",
  "audio/aac",
];

// Streams an audio file straight to S3 and exposes the key on req.file.key.
const mediaAudioUploadS3 = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || ".mp3";
      const filename = `meditations/audio/${randomUUID()}${ext}`;
      cb(null, filename);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (ALLOWED_AUDIO_MIMETYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only audio files are allowed (mp3, wav, m4a, ogg, webm, aac)"));
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
});

module.exports = mediaAudioUploadS3;
