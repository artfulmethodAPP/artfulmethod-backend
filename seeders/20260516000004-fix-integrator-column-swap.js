"use strict";

/**
 * Fix: Integrator Lesson_Contents column swap (ids 42–51 / course_lesson_id 1–10).
 * The original insert put the S3 key into prompts_json and the artwork_info text
 * into image_s3_key. This seeder corrects all three columns to their right values.
 *
 * Run:  npx sequelize-cli db:seed --seed 20260516000004-fix-integrator-column-swap.js
 * Undo: npx sequelize-cli db:seed:undo --seed 20260516000004-fix-integrator-column-swap.js
 */

// [course_lesson_id, correct_image_s3_key, correct_prompts_json]
const FIXES = [
  [
    1,
    "test-uploads/89738dcf-a719-4c73-bed2-46e4c951c1f4.jpg",
    JSON.stringify([
      { prompt_number: 1, prompt_text: "If this image were a headline, what would it say?" },
      { prompt_number: 2, prompt_text: "What does that headline leave out?" },
      { prompt_number: 3, prompt_text: "What perspective or story does this headline shape?" },
    ]),
  ],
  [
    2,
    "test-uploads/baa8b6be-07c2-4ca7-a5de-157c11116621.jpg",
    JSON.stringify([
      { prompt_number: 1, prompt_text: "What is happening in this image?" },
      { prompt_number: 2, prompt_text: "So what does it matter?" },
      { prompt_number: 3, prompt_text: "Now what does it ask of you?" },
    ]),
  ],
  [
    3,
    "test-uploads/b4b8a56e-8f7c-4fb0-9532-d7808b1c1876.jpg",
    JSON.stringify([
      { prompt_number: 1, prompt_text: "What meaning does this image hold for you personally?" },
      { prompt_number: 2, prompt_text: "What meaning might it hold more broadly?" },
      { prompt_number: 3, prompt_text: "How could this meaning influence the way people think or act?" },
    ]),
  ],
  [
    4,
    "test-uploads/20d99977-c4d2-4647-838e-d9bded3146d5.jpg",
    JSON.stringify([
      { prompt_number: 1, prompt_text: "What connections do you make?" },
      { prompt_number: 2, prompt_text: "What challenges does it raise?" },
      { prompt_number: 3, prompt_text: "What concepts and changes does it suggest?" },
    ]),
  ],
  [
    5,
    "test-uploads/53cfdce8-ae0f-4a0d-90b7-d77a181a3ace.jpg",
    JSON.stringify([
      { prompt_number: 1, prompt_text: "What would you share about this image?" },
      { prompt_number: 2, prompt_text: "What would you ask?" },
      { prompt_number: 3, prompt_text: "What ideas and new learning does it generate?" },
    ]),
  ],
  [
    6,
    "test-uploads/52a7eebb-cf2d-44fd-92c5-3c2b366c8b83.jpg",
    JSON.stringify([
      { prompt_number: 1, prompt_text: "What do you reflect on when you look at this?" },
      { prompt_number: 2, prompt_text: "What does it connect to?" },
      { prompt_number: 3, prompt_text: "What does it project forward toward?" },
    ]),
  ],
  [
    7,
    "test-uploads/5d421ad3-3173-4f03-ac84-a3fe3f9ca87e.jpg",
    JSON.stringify([
      { prompt_number: 1, prompt_text: "Why does this image matter to you?" },
      { prompt_number: 2, prompt_text: "Why might it matter to those around you?" },
      { prompt_number: 3, prompt_text: "Why might it matter to the world?" },
    ]),
  ],
  [
    8,
    "test-uploads/1b0cc963-01da-43b8-a195-6842ee2a368c.jpg",
    JSON.stringify([
      { prompt_number: 1, prompt_text: "Step in: what do you see up close?" },
      { prompt_number: 2, prompt_text: "Step out: what do you see from a distance?" },
      { prompt_number: 3, prompt_text: "Step back: what is the whole picture?" },
    ]),
  ],
  [
    9,
    "test-uploads/e5d240cb-ec78-4e7f-90b1-933f3a7a0dc1.jpg",
    JSON.stringify([
      { prompt_number: 1, prompt_text: "What do you see?" },
      { prompt_number: 2, prompt_text: "What do you think?" },
      { prompt_number: 3, prompt_text: "What does it mean to you, and what does it mean to us?" },
    ]),
  ],
  [
    10,
    "test-uploads/e6aaf6e6-9c64-4974-b50f-c620b50098a3.jpg",
    JSON.stringify([
      { prompt_number: 1, prompt_text: "What does this image suggest about what could be?" },
      { prompt_number: 2, prompt_text: "What small step could you take toward that?" },
      { prompt_number: 3, prompt_text: "How could this idea create long-term impact or change?" },
    ]),
  ],
];

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await Promise.all(
      FIXES.map(([lessonId, image_s3_key, prompts_json]) =>
        queryInterface.sequelize.query(
          "UPDATE `Lesson_Contents` SET image_s3_key = :image_s3_key, prompts_json = :prompts_json, updated_at = :now WHERE course_lesson_id = :lessonId",
          { replacements: { image_s3_key, prompts_json, now, lessonId } },
        ),
      ),
    );
    console.log("[seed] Fixed image_s3_key and prompts_json on 10 Integrator lesson content rows.");
  },

  async down(queryInterface) {
    // Reverting would re-introduce the corruption — intentionally left as no-op.
    console.log("[seed:undo] No-op: column swap fix cannot be meaningfully reversed.");
  },
};
