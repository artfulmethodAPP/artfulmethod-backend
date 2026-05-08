const asyncHandler = require("../utils/async-handler");
const { sendSuccess } = require("../utils/api-response");
const AppError = require("../utils/app-error");
const TranscribeService = require("../services/transcribe.service");
const { getPresignedUrl } = require("../services/s3.service");
const { AudioTranscript } = require("../models");

const saveTranscript = asyncHandler(async (req, res) => {
  const { transcript_id, text, duration, language, wordCount } = req.body;
  const transcript = await TranscribeService.saveTranscript({
    userId: req.user.id,
    transcriptId: transcript_id,
    text,
    duration,
    language,
    wordCount,
  });

  return sendSuccess(res, {
    statusCode: 201,
    message: "Transcript saved successfully",
    data: { transcript },
  });
});

const transcribeAudio = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("Audio file is required", 400, "VALIDATION_ERROR");
  }

  const { transcription, transcript_id } = await TranscribeService.transcribeAudio({
    fileBuffer: req.file.buffer,
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    userId: req.user.id,
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: "Audio transcribed successfully",
    data: { transcription, transcript_id },
  });
});

// GET /api/v1/transcribe/audio/:id
// Returns a fresh 1-hour presigned URL for the stored audio file
const getAudioUrl = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const transcript = await AudioTranscript.findOne({
    where: { id, user_id: userId },
  });

  if (!transcript) {
    throw new AppError("Transcript not found", 404, "NOT_FOUND");
  }

  if (!transcript.audio_s3_key) {
    throw new AppError("Audio file not available for this transcript", 404, "NOT_FOUND");
  }

  const audio_url = await getPresignedUrl(transcript.audio_s3_key);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Audio URL generated successfully",
    data: { audio_url },
  });
});

module.exports = {
  saveTranscript,
  transcribeAudio,
  getAudioUrl,
};
