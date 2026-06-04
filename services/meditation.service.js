"use strict";

const { ArtfulMeditation } = require("../models");
const AppError = require("../utils/app-error");
const { getPresignedUrl } = require("./s3.service");

// Shared meditation copy — identical for every Artful Meditation, so it lives
// here as a single source of truth rather than a per-row DB column.
const MEDITATION_TEXT =
  "Slow down with a work of art. In these moments, we sit with a single piece and explore what it brings up. What do you notice? What does it make you feel? What questions does it open? There's no right answer, only your answer in this moment. Starting with our own meditations, these moments show one way of looking, one way of listening to what art can teach us. Over time, you'll hear from others too. Different perspectives on the same work. Use these as company for your own looking. A guide, a reflection, maybe even a provocation. Because art moves us when we're brave enough to let it.";

// Shape a meditation row for the API — strip S3 keys, attach presigned URLs.
const presentMeditation = async (m) => {
  const { image_s3_key, audio_s3_key, ...plain } = m.toJSON();
  const [image_url, audio_url] = await Promise.all([
    image_s3_key ? getPresignedUrl(image_s3_key) : null,
    audio_s3_key ? getPresignedUrl(audio_s3_key) : null,
  ]);
  return {
    ...plain,
    image_url,
    audio_url,
    meditation_text: MEDITATION_TEXT,
  };
};

// GET /api/v1/meditations — list active meditations in sequence order.
const getAllMeditations = async () => {
  const meditations = await ArtfulMeditation.findAll({
    where: { is_active: true },
    order: [["sort_order", "ASC"]],
  });
  return Promise.all(meditations.map(presentMeditation));
};

// GET /api/v1/meditations/:id — single meditation detail.
const getMeditationById = async (id) => {
  const meditation = await ArtfulMeditation.findByPk(id);
  if (!meditation) {
    throw new AppError("Meditation not found", 404, "NOT_FOUND");
  }
  return presentMeditation(meditation);
};

module.exports = {
  MEDITATION_TEXT,
  getAllMeditations,
  getMeditationById,
};
