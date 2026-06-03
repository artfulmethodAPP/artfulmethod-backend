"use strict";

/**
 * Seed: Lesson_Contents — The Framer
 * Seeds 10 lesson content rows for course_lesson_id 21–30 (The Framer lessons).
 * Depends on: 20260516000001-seed-course-lessons.js
 * Idempotent — skips if any content already exists for lesson IDs 21–30.
 *
 * Run:  npx sequelize-cli db:seed --seed 20260602000004-seed-framer-lesson-contents.js
 * Undo: npx sequelize-cli db:seed:undo --seed 20260602000004-seed-framer-lesson-contents.js
 */

// course_lesson_id 21–30 map to CONTENTS[0..9] in order.
const FRAMER_LESSON_IDS = [21, 22, 23, 24, 25, 26, 27, 28, 29, 30];

// One entry per Framer lesson, in order (course_lesson_id 21..30).
// { artwork_title, artist_name, years, artwork_info, image_s3_key, prompts_json }
const CONTENTS = [
  {
    artwork_title: "Boys Picking Lotus",
    artist_name: "Unknown Artist China",
    years: "1736–95",
    artwork_info:
      "In this Qing dynasty painting from the Qianlong period (1736–95), Chinese boys wade through water to pick lotus flowers; a scene that captures both the playful innocence of childhood and the lotus symbolic meaning of purity and enlightenment in Chinese culture, creating a moment where everyday labor becomes a meditation on beauty and growth.",
    image_s3_key: "courses/artwork/3007b48c-73e0-4433-b14d-8b863cc6c797.jpg",
    prompts_json: [
      { prompt_number: 1, prompt_text: "What's going on here, list what you see." },
      { prompt_number: 2, prompt_text: "What in the picture is your evidence?" },
      { prompt_number: 3, prompt_text: "Look again, and describe any changes." },
    ],
  },
  {
    artwork_title:
      "Royal Reception in a Landscape left folio from the double frontispiece of a Shahnama",
    artist_name: "Unknown Artist Iran Shiraz",
    years: "1444",
    artwork_info:
      "It's a lavishly painted 1444 Persian manuscript page showing a royal outdoor feast with hunters, diplomats, and servants, a snapshot of Timurid court life used to open Iran's national epic.",
    image_s3_key: "courses/artwork/92e63e50-ecd9-4479-ba90-a3ec4c2c92da.jpg",
    prompts_json: [
      { prompt_number: 1, prompt_text: "What matches what you'd expect to find?" },
      { prompt_number: 2, prompt_text: "What doesn't fit?" },
      { prompt_number: 3, prompt_text: "What's your evidence either way?" },
    ],
  },
  {
    artwork_title: "The Milliners",
    artist_name: "Edgar Degas",
    years: "c. 1882 – before 1905",
    artwork_info:
      "Degas watches two milliners work, one focused, one lost in thought, and makes you feel the exhaustion underneath the elegance of the hats they're making.",
    image_s3_key: "courses/artwork/ab5a6c2d-7f7f-4de2-9bac-7b75bab03f62.jpg",
    prompts_json: [
      { prompt_number: 1, prompt_text: "What do you notice in the first 30 seconds?" },
      { prompt_number: 2, prompt_text: "What appears when you stay with it longer?" },
      { prompt_number: 3, prompt_text: "What emerges only through patient, sustained looking?" },
    ],
  },
  {
    artwork_title: "Banquet Still Life",
    artist_name: "Adriaen van Utrecht",
    years: "1644",
    artwork_info:
      "A table overwhelmed with abundance, lobster, fruit, silver, Chinese porcelain, a parrot, a monkey, and a dog announces that the Flemish painter Adriaen van Utrecht could render virtually any surface or texture the seventeenth-century world of wealth had to offer.",
    image_s3_key: "courses/artwork/41556286-63d1-4c2a-9070-fdcea0a32dec.jpg",
    prompts_json: [
      { prompt_number: 1, prompt_text: "What can you state as fact?" },
      { prompt_number: 2, prompt_text: "Where are you inferring or filling the gaps?" },
      { prompt_number: 3, prompt_text: "Why might those gaps be important to the story you're building?" },
    ],
  },
  {
    artwork_title: "Bullfight",
    artist_name: "Édouard Manet",
    years: "1865",
    artwork_info:
      "A small, swift watercolor in which Manet distills the violence and pageantry of the bullring into loose, confident marks that already carry the restless visual intelligence he would bring to everything he touched.",
    image_s3_key: "courses/artwork/bd881e91-3574-4244-b850-e4f98e302d2f.jpg",
    prompts_json: [
      { prompt_number: 1, prompt_text: "What's clear and certain?" },
      { prompt_number: 2, prompt_text: "Where does the evidence run out?" },
      { prompt_number: 3, prompt_text: "What becomes possible when you accept what you don't know?" },
    ],
  },
  {
    artwork_title: "Young Italian Woman with Puck the Dog",
    artist_name: "Thérèse Schwartze",
    years: "c. 1885–86",
    artwork_info:
      "Painted in Paris by a Dutch woman who had no business being there by the standards of her time, this large, quietly assured portrait of a professional Italian model and her small dog carries the confidence of an artist who had already decided she would not be overlooked.",
    image_s3_key: "courses/artwork/18d8be57-fb08-41c8-b7b6-03e73168fef7.jpg",
    prompts_json: [
      { prompt_number: 1, prompt_text: "Identify the colors, shapes and lines." },
      { prompt_number: 2, prompt_text: "What's each one doing?" },
      { prompt_number: 3, prompt_text: "What's your reasoning?" },
    ],
  },
  {
    artwork_title: "The Singel Bridge at the Paleisstraat in Amsterdam",
    artist_name: "George Hendrik Breitner",
    years: "1896",
    artwork_info:
      "Breitner used photographs to prepare this winter scene on the Singel, and the cropped, head-on composition makes that debt visible, a woman in a fur-trimmed coat bearing down on us through the cold with the blunt immediacy of a snapshot.",
    image_s3_key: "courses/artwork/87f64a6a-a9cb-4650-a0a1-6ad02d9ad824.jpg",
    prompts_json: [
      { prompt_number: 1, prompt_text: "What are the parts of this image?" },
      { prompt_number: 2, prompt_text: "What's each one for?" },
      { prompt_number: 3, prompt_text: "Where does it get more complex than it looked?" },
    ],
  },
  {
    artwork_title: "Landscape with Two Poplars",
    artist_name: "Wassily Kandinsky",
    years: "1912",
    artwork_info:
      "Painted in 1912, the year before Kandinsky published his landmark text on abstraction, this oil holds the landscape world just at the point of dissolving, two towering poplars still recognizable but already giving way to color and force as the primary subject.",
    image_s3_key: "courses/artwork/5e1c3528-aabc-4392-8ffe-32428f084897.jpg",
    prompts_json: [
      { prompt_number: 1, prompt_text: "Pick one feature. What is it?" },
      { prompt_number: 2, prompt_text: "Why is it that way?" },
      { prompt_number: 3, prompt_text: "What else could account for it?" },
    ],
  },
  {
    artwork_title: "Ice-Skating in a Village",
    artist_name: "Hendrick Avercamp",
    years: "c. 1610",
    artwork_info:
      "A frozen canal fills with the whole texture of Dutch village life, skaters and players and unlucky souls who have broken through the ice, rendered by Avercamp with the patient, delighted attention of someone who could watch people all day.",
    image_s3_key: "courses/artwork/cde0974c-f16c-4bbf-ae05-aecfbf64df54.jpg",
    prompts_json: [
      { prompt_number: 1, prompt_text: "Look slowly and talk us through what you see." },
      { prompt_number: 2, prompt_text: "What's coming to mind as you look?" },
      { prompt_number: 3, prompt_text: "How does that show up in the image?" },
    ],
  },
  {
    artwork_title: "The Plum Garden at Kameido Shrine",
    artist_name: "Utagawa Hiroshige I",
    years: "1857",
    artwork_info:
      "Hiroshige's plum garden compresses the world into a single radical act of looking, branches filling the foreground so close and dark they become almost abstract, while the blossoming trees beyond glow with a warmth that makes the distance feel like a longing.",
    image_s3_key: "courses/artwork/6f53dae7-3127-4d8b-894f-626c32aa5eaf.jpg",
    prompts_json: [
      { prompt_number: 1, prompt_text: "What do you take as established here?" },
      { prompt_number: 2, prompt_text: "What doesn't add up?" },
      { prompt_number: 3, prompt_text: "What could settle it?" },
    ],
  },
];

module.exports = {
  async up(queryInterface) {
    // Idempotency guard — skip if any content already exists for these lessons
    const [existing] = await queryInterface.sequelize.query(
      `SELECT COUNT(*) as count FROM \`Lesson_Contents\` WHERE course_lesson_id IN (${FRAMER_LESSON_IDS.join(",")})`,
      { type: queryInterface.sequelize.QueryTypes.SELECT },
    );
    if (existing.count > 0) {
      console.log("[seed] Framer lesson contents already seeded — skipping.");
      return;
    }

    const now = new Date();

    const rows = CONTENTS.map((c, i) => ({
      course_lesson_id: FRAMER_LESSON_IDS[i],
      artwork_title: c.artwork_title,
      artist_name: c.artist_name,
      years: c.years,
      artwork_info: c.artwork_info,
      image_s3_key: c.image_s3_key,
      prompts_json: JSON.stringify(c.prompts_json),
      created_at: now,
      updated_at: now,
    }));

    await queryInterface.bulkInsert("Lesson_Contents", rows, {});
    console.log(`[seed] Inserted ${rows.length} Framer lesson contents.`);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Lesson_Contents", {
      course_lesson_id: FRAMER_LESSON_IDS,
    });
  },
};
