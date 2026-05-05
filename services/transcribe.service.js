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

// Upload raw audio buffer to S3 audio/ folder
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

  return `${process.env.AWS_PREVIEW}/${key}`;
};

// Upload transcript text to S3 transcripts/ folder
const uploadTranscriptToS3 = async (text) => {
  const key = `transcripts/${randomUUID()}.txt`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET,
      Key: key,
      Body: text,
      ContentType: "text/plain",
    }),
  );

  return `${process.env.AWS_PREVIEW}/${key}`;
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

  const [elevenLabsResponse, audioUrl] = await Promise.all([
    elevenLabsRequest,
    s3UploadRequest,
  ]);

  await AudioTranscript.create({
    user_id: userId,
    transcript_text: elevenLabsResponse.data.text || "",
    duration_seconds: elevenLabsResponse.data.audio_duration ?? 0,
    language: elevenLabsResponse.data.language_code || "unknown",
    word_count: countWords(elevenLabsResponse.data.text || ""),
    character_count: (elevenLabsResponse.data.text || "").length,
    audio_s3_url: audioUrl,
  });

  return {
    transcription: elevenLabsResponse.data,
    audioUrl,
  };
};

// Save transcript to DB AND upload text file to S3 in parallel
const saveTranscript = async ({ userId, text, duration, language, wordCount }) => {
  const normalizedText = text.trim();
  const computedWordCount = countWords(normalizedText);

  const [transcript, transcriptUrl] = await Promise.all([
    AudioTranscript.create({
      user_id: userId,
      transcript_text: normalizedText,
      duration_seconds: duration ?? null,
      language: language?.trim() ?? null,
      word_count: wordCount ?? computedWordCount,
      character_count: normalizedText.length,
    }),
    uploadTranscriptToS3(normalizedText),
  ]);

  // Store the S3 URL on the record
  await transcript.update({ transcript_s3_url: transcriptUrl });

  return { ...transcript.toJSON(), transcript_s3_url: transcriptUrl };
};

module.exports = {
  saveTranscript,
  transcribeAudio,
};
