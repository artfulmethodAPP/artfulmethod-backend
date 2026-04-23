const axios = require("axios");
const FormData = require("form-data");
const path = require("path");
const AppError = require("../utils/app-error");
const { AudioTranscript } = require("../models");

const countWords = (text) => {
  const trimmedText = text.trim();

  if (!trimmedText) {
    return 0;
  }

  return trimmedText.split(/\s+/).length;
};

const saveTranscript = async ({ userId, text, duration, language, wordCount }) => {
  const normalizedText = text.trim();
  const normalizedLanguage = language.trim();
  const computedWordCount = countWords(normalizedText);

  const transcript = await AudioTranscript.create({
    user_id: userId,
    transcript_text: normalizedText,
    duration_seconds: duration,
    language: normalizedLanguage,
    word_count: wordCount ?? computedWordCount,
    character_count: normalizedText.length,
  });

  return transcript;
};

const transcribeAudio = async ({ fileBuffer, originalname, mimetype }) => {
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

  try {
    const response = await axios.post(
      "https://api.elevenlabs.io/v1/speech-to-text",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          "xi-api-key": apiKey,
        },
      },
    );

    return response.data;
  } catch (error) {
    const status = error.response?.status;
    if (status === 401) {
      throw new AppError("ElevenLabs API key is invalid or expired", 500, "ELEVENLABS_NOT_CONFIGURED");
    }
    throw new AppError(
      error.response?.data?.detail?.message || error.response?.data?.message || "ElevenLabs transcription failed",
      500,
      "TRANSCRIPTION_FAILED",
    );
  }
};

module.exports = {
  saveTranscript,
  transcribeAudio,
};
