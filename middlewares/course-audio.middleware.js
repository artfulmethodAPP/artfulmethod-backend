const multer = require("multer");

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
  "video/webm", // some browsers send webm recordings with video/* type
];

// Keep files in memory — buffer needed for ElevenLabs transcription
const courseAudioUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (ALLOWED_AUDIO_MIMETYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only audio files are allowed (mp3, wav, m4a, ogg, webm, aac)"));
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
});

module.exports = courseAudioUpload;
