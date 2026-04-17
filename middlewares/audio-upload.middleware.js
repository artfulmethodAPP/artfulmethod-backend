const multer = require("multer");

const ALLOWED_AUDIO_MIMETYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/ogg",
  "audio/webm",
  "audio/mp4",
  "audio/x-m4a",
  "audio/aac",
  "audio/flac",
];

const audioUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (ALLOWED_AUDIO_MIMETYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only audio files are allowed (mp3, wav, ogg, webm, m4a, aac, flac)"));
    }
  },
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB — ElevenLabs limit
});

module.exports = audioUpload;
