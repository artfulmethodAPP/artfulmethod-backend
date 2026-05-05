const asyncHandler = require("../utils/async-handler");
const { sendSuccess } = require("../utils/api-response");
const AppError = require("../utils/app-error");
const TranscribeService = require("../services/transcribe.service");

const saveTranscript = asyncHandler(async (req, res) => {
  const transcript = await TranscribeService.saveTranscript({
    userId: req.user.id,
    ...req.body,
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

  const { transcription, audioUrl } = await TranscribeService.transcribeAudio({
    fileBuffer: req.file.buffer,
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    userId: req.user.id,
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: "Audio transcribed successfully",
    data: { transcription, audioUrl },
  });
});

module.exports = {
  saveTranscript,
  transcribeAudio,
};
