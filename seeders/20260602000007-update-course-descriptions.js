"use strict";

/**
 * Seed: Update Course descriptions
 * Replaces the `description` field for the 5 courses with the perceptual intro text.
 * A blank line (\n\n) separates the two sentences so the frontend can render the
 * paragraph break. No other course fields are touched.
 *
 * Run:  npx sequelize-cli db:seed --seed 20260602000007-update-course-descriptions.js
 * Undo: npx sequelize-cli db:seed:undo --seed 20260602000007-update-course-descriptions.js
 */

// name -> new description (exact text; "\n\n" inserts the paragraph break)
const NEW_DESCRIPTIONS = {
  "The Storyteller":
    "You see the world as a series of moments, each one a story waiting to unfold.\n\nYour strength lies in finding meaning in the narrative arc.",
  "The Framer":
    "You see the world as a composition of parts, each detail contributing to a larger whole.\n\nYour strength lies in building meaning from what you observe.",
  "The Integrator":
    "You see connections where others see separate parts.\n\nYour strength lies in weaving meaning across multiple ways of looking.",
  "The Artist":
    "You see possibility beneath certainty.\n\nYour strength lies in staying with ambiguity.",
  "The Archivist":
    "You see questions where others seek answers.\n\nYour strength lies in exploring the unknown.",
};

// Original descriptions (from 20260516000000-seed-courses.js) for clean rollback.
const OLD_DESCRIPTIONS = {
  "The Storyteller":
    "Find the narrative thread. Learn to weave observation into compelling stories and meaning.",
  "The Framer":
    "Build frameworks and systems. Unlock this archetype after completing Storyteller.",
  "The Archivist":
    "Master context and historical patterns. Deepen your perceptual range with archival thinking.",
  "The Artist":
    "Stay with what they feel before you explain it. Let meaning emerge through attention, not conclusions.",
  "The Integrator":
    "Simultaneously hold the personal and universal. Master the art of synthesis and connection-making.",
};

async function applyDescriptions(queryInterface, map) {
  const now = new Date();
  for (const [name, description] of Object.entries(map)) {
    await queryInterface.sequelize.query(
      "UPDATE `Courses` SET description = :description, updated_at = :now WHERE name = :name",
      {
        replacements: { description, now, name },
        type: queryInterface.sequelize.QueryTypes.UPDATE,
      },
    );
  }
}

module.exports = {
  async up(queryInterface) {
    await applyDescriptions(queryInterface, NEW_DESCRIPTIONS);
    console.log("[seed] Course descriptions updated.");
  },

  async down(queryInterface) {
    await applyDescriptions(queryInterface, OLD_DESCRIPTIONS);
    console.log("[seed] Course descriptions reverted.");
  },
};
