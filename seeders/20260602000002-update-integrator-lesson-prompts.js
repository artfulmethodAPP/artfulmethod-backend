"use strict";

/**
 * Seed: Update prompts for Integrator lessons (course_lesson_ids 1–10)
 * Only updates prompts_json — artwork, image, and other fields are untouched.
 * Depends on: 20260516000002-seed-integrator-lesson-contents.js
 *
 * Run:  npx sequelize-cli db:seed --seed 20260602000002-update-integrator-lesson-prompts.js
 * Undo: npx sequelize-cli db:seed:undo --seed 20260602000002-update-integrator-lesson-prompts.js
 */

// [course_lesson_id, prompt1, prompt2, prompt3]
const NEW_PROMPTS = [
  [1, "If this were the beginning of something what would it be the beginning of?", "What gets left out of that?", "What larger story might it belong to?"],
  [2, "What's opening up here?", "So what possibilities does that stir?", "Now what feels worth exploring?"],
  [3, "What might this mean to you right now?", "What else might it mean?", "How many different ways could that meaning move?"],
  [4, "What connects?", "What questions does it raise?", "What could emerge from sitting with both?"],
  [5, "What would you share?", "What would you ask?", "What new territory does that open?"],
  [6, "What stays with you?", "What does it reach toward?", "What becomes possible from here?"],
  [7, "Why might this matter to you?", "Why might it matter to those around you?", "Why might it matter beyond what you can see?"],
  [8, "What do you notice close up?", "What opens out when you step back?", "What becomes possible when you hold it all?"],
  [9, "Look slowly and talk us through what you see.", "What's stirring as you look?", "Where might that take you?"],
  [10, "Hold all of it. What could this become?", "What small move opens toward it?", "What might grow from staying curious here?"],
];

const OLD_PROMPTS = [
  [1, "If this image were a headline, what would it say?", "What does that headline leave out?", "What perspective or story does this headline shape?"],
  [2, "What is happening in this image?", "So what does it matter?", "Now what does it ask of you?"],
  [3, "What meaning does this image hold for you personally?", "What meaning might it hold more broadly?", "How could this meaning influence the way people think or act?"],
  [4, "What connections do you make?", "What challenges does it raise?", "What concepts and changes does it suggest?"],
  [5, "What would you share about this image?", "What would you ask?", "What ideas and new learning does it generate?"],
  [6, "What do you reflect on when you look at this?", "What does it connect to?", "What does it project forward toward?"],
  [7, "Why does this image matter to you?", "Why might it matter to those around you?", "Why might it matter to the world?"],
  [8, "Step in: what do you see up close?", "Step out: what do you see from a distance?", "Step back: what is the whole picture?"],
  [9, "What do you see?", "What do you think?", "What does it mean to you, and what does it mean to us?"],
  [10, "What does this image suggest about what could be?", "What small step could you take toward that?", "How could this idea create long-term impact or change?"],
];

async function applyPrompts(queryInterface, prompts) {
  const now = new Date();
  for (const [id, p1, p2, p3] of prompts) {
    const promptsJson = JSON.stringify([
      { prompt_number: 1, prompt_text: p1 },
      { prompt_number: 2, prompt_text: p2 },
      { prompt_number: 3, prompt_text: p3 },
    ]);
    await queryInterface.sequelize.query(
      "UPDATE `Lesson_Contents` SET prompts_json = :promptsJson, updated_at = :now WHERE course_lesson_id = :id",
      {
        replacements: { promptsJson, now, id },
        type: queryInterface.sequelize.QueryTypes.UPDATE,
      },
    );
  }
}

module.exports = {
  async up(queryInterface) {
    await applyPrompts(queryInterface, NEW_PROMPTS);
    console.log("[seed] Integrator lesson prompts updated.");
  },

  async down(queryInterface) {
    await applyPrompts(queryInterface, OLD_PROMPTS);
    console.log("[seed] Integrator lesson prompts reverted.");
  },
};
