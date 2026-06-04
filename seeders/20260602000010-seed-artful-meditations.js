"use strict";

/**
 * Seed: Artful_Meditations
 * One meditation per archetype. Matched/guarded by `archetype` (unique).
 * Idempotent — skips any archetype that already has a meditation row.
 *
 * Run:  npx sequelize-cli db:seed --seed 20260602000010-seed-artful-meditations.js
 * Undo: npx sequelize-cli db:seed:undo --seed 20260602000010-seed-artful-meditations.js
 */

const MEDITATIONS = [
  {
    archetype: "Storyteller",
    artwork_title: "Apollo and Daphne",
    artist_name: "Gian Lorenzo Bernini",
    years: "1622–25",
    medium: "Marble",
    dimensions: "H. 243 cm",
    location: "Galleria Borghese, Rome",
    about_art:
      "Apollo and Daphne / Gian Lorenzo Bernini, 1622–25 The moment of transformation. Marble captures the split second between pursuit and escape, between one life ending and another beginning.",
    image_s3_key: "meditations/images/72168fa7-4e8d-45fc-9e91-e351075224bd.jpg",
    audio_s3_key: "meditations/audio/107e7140-4c64-4bf2-8f8c-e485321aad1d.mp3",
    audio_duration: "3:59",
    sort_order: 2,
    is_active: true,
  },
  {
    archetype: "Framer",
    artwork_title: "Woman Waiting for the Moon",
    artist_name: "Uemura Shoen (Japanese, 1875–1949)",
    years: "1944",
    medium: "Color on silk",
    dimensions: "156.2 × 51.5 cm",
    location: "Itsuo Art Museum, Osaka",
    about_art:
      "Woman Waiting for the Moon / Uemura Shoen, 1944 A woman in stillness, draped in silk, suspended between earthly solitude and celestial longing. Shoen painted desire as a quiet act of waiting.",
    image_s3_key: "meditations/images/cb00aa8c-c2e2-43b6-a2ce-52114fe2344e.jpg",
    audio_s3_key: "meditations/audio/49fbab42-f5ba-4ec6-9940-19ce05fec38c.mp3",
    audio_duration: "0:53",
    sort_order: 3,
    is_active: true,
  },
  {
    archetype: "Archivist",
    artwork_title: "Winter Night in the Mountains",
    artist_name: "Harald Sohlberg (Norwegian, 1869–1935)",
    years: "1914",
    medium: "Oil on canvas",
    dimensions: "160 × 200 cm",
    location: "Nasjonalmuseet, Oslo",
    about_art:
      "Winter Night in the Mountains / Harald Sohlberg, 1914 Deep snow, distant light, a cabin holding warmth against the vast cold. Sohlberg captures the moment when stillness feels almost unbearable.",
    image_s3_key: "meditations/images/d796fa66-cc51-4723-be79-1d9485ed5dd6.jpg",
    audio_s3_key: "meditations/audio/d93ab213-9505-4693-afc8-7bec83b9d0fa.mp3",
    audio_duration: "1:07",
    sort_order: 4,
    is_active: true,
  },
  {
    archetype: "Artist",
    artwork_title: "Flower Clouds",
    artist_name: "Odilon Redon (French, 1840–1916)",
    years: "c. 1903",
    medium: "Pastel on blue-gray paper mounted on cardboard",
    dimensions: "44.5 × 54.2 cm",
    location: "Art Institute of Chicago",
    about_art:
      "Flower Clouds / Odilon Redon, c. 1903 Soft forms floating in nothing. Redon spent his life painting what he saw with his eyes closed, inviting us to do the same.",
    image_s3_key: "meditations/images/5492cd40-4318-4d1b-8b4c-4541d8d5cdb4.jpg",
    audio_s3_key: "meditations/audio/182c30da-57fb-48cd-bafd-8123cec6e460.mp3",
    audio_duration: "0:59",
    sort_order: 5,
    is_active: true,
  },
  {
    archetype: "Integrator",
    artwork_title: "Dance in Baden-Baden",
    artist_name: "Max Beckmann (German, 1884–1950)",
    years: "1923",
    medium: "Oil on canvas",
    dimensions: "100.5 × 65.5 cm",
    location: "Lenbachhaus, Munich",
    about_art:
      "Dance in Baden-Baden / Max Beckmann, 1923 Bodies in motion, faces abstracted into geometry, joy colliding with something darker. Beckmann shows us that celebration and unease can occupy the same room.",
    image_s3_key: "meditations/images/0c40e821-c1ed-45b4-9880-cdb2b0a68ef6.jpg",
    audio_s3_key: "meditations/audio/6b9aa308-a51e-42a3-974a-1f5e185bcc30.mp3",
    audio_duration: "1:14",
    sort_order: 1,
    is_active: true,
  },
];

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const rows = [];

    for (const m of MEDITATIONS) {
      const [existing] = await queryInterface.sequelize.query(
        "SELECT COUNT(*) as count FROM `Artful_Meditations` WHERE archetype = :archetype",
        {
          replacements: { archetype: m.archetype },
          type: queryInterface.sequelize.QueryTypes.SELECT,
        },
      );
      if (existing.count > 0) {
        console.log(`[seed] Meditation for ${m.archetype} already exists — skipping.`);
        continue;
      }
      rows.push({ ...m, created_at: now, updated_at: now });
    }

    if (rows.length === 0) {
      console.log("[seed] No new meditations to insert.");
      return;
    }

    await queryInterface.bulkInsert("Artful_Meditations", rows, {});
    console.log(`[seed] Inserted ${rows.length} meditation(s).`);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Artful_Meditations", {
      archetype: MEDITATIONS.map((m) => m.archetype),
    });
  },
};
