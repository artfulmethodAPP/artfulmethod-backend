"use strict";

/**
 * Seed: Update Artful_Meditations image_s3_key for Integrator and Storyteller.
 * The base meditations were already seeded (20260602000010), and that seeder is
 * idempotent (insert-only), so it will not re-run. This update seeder swaps the
 * two image keys via UPDATE so the change reflects on the next deploy.
 *
 * Run:  npx sequelize-cli db:seed --seed 20260602000011-update-meditation-images.js
 * Undo: npx sequelize-cli db:seed:undo --seed 20260602000011-update-meditation-images.js
 */

// archetype -> { new image key, old image key (for clean rollback) }
const IMAGE_UPDATES = {
  Integrator: {
    new: "meditations/images/2b86444a-7cca-45ec-aaa4-8ab165e1f559.jpg",
    old: "meditations/images/0c40e821-c1ed-45b4-9880-cdb2b0a68ef6.jpg",
  },
  Storyteller: {
    new: "meditations/images/6e2c3ae0-a813-44c8-913d-fadcbc169128.jpg",
    old: "meditations/images/72168fa7-4e8d-45fc-9e91-e351075224bd.jpg",
  },
};

async function applyImages(queryInterface, pick) {
  const now = new Date();
  for (const [archetype, keys] of Object.entries(IMAGE_UPDATES)) {
    await queryInterface.sequelize.query(
      "UPDATE `Artful_Meditations` SET image_s3_key = :key, updated_at = :now WHERE archetype = :archetype",
      {
        replacements: { key: keys[pick], now, archetype },
        type: queryInterface.sequelize.QueryTypes.UPDATE,
      },
    );
  }
}

module.exports = {
  async up(queryInterface) {
    await applyImages(queryInterface, "new");
    console.log("[seed] Updated Integrator and Storyteller meditation images.");
  },

  async down(queryInterface) {
    await applyImages(queryInterface, "old");
    console.log("[seed] Reverted Integrator and Storyteller meditation images.");
  },
};
