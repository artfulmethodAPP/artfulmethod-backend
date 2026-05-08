const axios = require("axios");
const FormData = require("form-data");
const path = require("path");
const { randomUUID } = require("crypto");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const AppError = require("../utils/app-error");
const { AudioTranscript } = require("../models");
const s3 = require("../config/s3.config");

const countWords = (text) => {
  const trimmedText = text.trim();
  if (!trimmedText) return 0;
  return trimmedText.split(/\s+/).length;
};

// Upload raw audio buffer to S3 — returns S3 key (not URL)
const uploadAudioToS3 = async ({ fileBuffer, originalname, mimetype }) => {
  const ext = path.extname(originalname).toLowerCase() || ".mp3";
  const key = `audio/${randomUUID()}${ext}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET,
      Key: key,
      Body: fileBuffer,
      ContentType: mimetype,
    }),
  );

  return key;
};

// Transcribe audio via ElevenLabs AND upload to S3 in parallel
const transcribeAudio = async ({ fileBuffer, originalname, mimetype, userId }) => {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new AppError("API key is not configured", 500, "ELEVENLABS_NOT_CONFIGURED");
  }

  const formData = new FormData();
  formData.append("file", fileBuffer, {
    filename: originalname || `audio${path.extname(originalname || ".mp3")}`,
    contentType: mimetype,
  });
  formData.append("model_id", "scribe_v1");

  const elevenLabsRequest = axios
    .post("https://api.elevenlabs.io/v1/speech-to-text", formData, {
      headers: {
        ...formData.getHeaders(),
        "xi-api-key": apiKey,
      },
    })
    .catch((error) => {
      const status = error.response?.status;
      if (status === 401) {
        throw new AppError(
          "ElevenLabs API key is invalid or expired",
          500,
          "ELEVENLABS_NOT_CONFIGURED",
        );
      }
      throw new AppError(
        error.response?.data?.detail?.message ||
          error.response?.data?.message ||
          "ElevenLabs transcription failed",
        500,
        "TRANSCRIPTION_FAILED",
      );
    });

  const s3UploadRequest = uploadAudioToS3({ fileBuffer, originalname, mimetype });

  const [elevenLabsResponse, audioS3Key] = await Promise.all([
    elevenLabsRequest,
    s3UploadRequest,
  ]);

  const transcript = await AudioTranscript.create({
    user_id: userId,
    transcript_text: elevenLabsResponse.data.text || "",
    duration_seconds: elevenLabsResponse.data.audio_duration ?? 0,
    language: elevenLabsResponse.data.language_code || "unknown",
    word_count: countWords(elevenLabsResponse.data.text || ""),
    character_count: (elevenLabsResponse.data.text || "").length,
    audio_s3_key: audioS3Key,
  });

  return {
    transcription: elevenLabsResponse.data,
    transcript_id: transcript.id,
  };
};

// Save transcript — no S3
// Audio flow:   transcript_id provided → update the record created by /audio (user may have edited text)
// Typing flow:  no transcript_id → create a new record, audio_s3_key stays null
const saveTranscript = async ({ userId, transcriptId, text, duration, language, wordCount }) => {
  const normalizedText = text.trim();
  const computedWordCount = countWords(normalizedText);

  if (transcriptId) {
    const existing = await AudioTranscript.findOne({
      where: { id: transcriptId, user_id: userId },
    });

    if (!existing) {
      throw new AppError("Transcript not found", 404, "NOT_FOUND");
    }

    await existing.update({
      transcript_text: normalizedText,
      word_count: wordCount ?? computedWordCount,
      character_count: normalizedText.length,
    });

    return existing.toJSON();
  }

  const transcript = await AudioTranscript.create({
    user_id: userId,
    transcript_text: normalizedText,
    duration_seconds: duration ?? null,
    language: language?.trim() ?? null,
    word_count: wordCount ?? computedWordCount,
    character_count: normalizedText.length,
  });

  return transcript.toJSON();
};

module.exports = {
  saveTranscript,
  transcribeAudio,
};
