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

module.exports = {
  saveTranscript,
};
