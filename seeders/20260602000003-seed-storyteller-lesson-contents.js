"use strict";

/**
 * Seed: Lesson_Contents — The Storyteller
 * Seeds 10 lesson content rows for course_lesson_id 11–20 (The Storyteller lessons).
 * Depends on: 20260516000001-seed-course-lessons.js
 * Idempotent — skips if any content already exists for lesson IDs 11–20.
 *
 * Run:  npx sequelize-cli db:seed --seed 20260602000003-seed-storyteller-lesson-contents.js
 * Undo: npx sequelize-cli db:seed:undo --seed 20260602000003-seed-storyteller-lesson-contents.js
 */

// course_lesson_id 11–20 map to CONTENTS[0..9] in order.
const STORYTELLER_LESSON_IDS = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

// One entry per Storyteller lesson, in order (course_lesson_id 11..20).
// { artwork_title, artist_name, years, artwork_info, image_s3_key, prompts_json }
const CONTENTS = [
  {
    artwork_title: "Lady Filmer in her Drawing Room",
    artist_name: "Mary Georgina Caroline, Lady Filmer",
    years: "1863–68",
    artwork_info:
      "Lady Filmer's photo collage places herself at the center of a fashionable gathering alongside the Prince of Wales, using scissors and watercolor to craft a social narrative that flattered her most important connections while relegating her own husband to the margins.",
    image_s3_key: "courses/artwork/39786eec-7d25-4642-99d3-317f2dabfb70.jpg",
    prompts_json: [
      { prompt_number: 1, prompt_text: "Talk about what you notice first." },
      { prompt_number: 2, prompt_text: "What story are you beginning to build?" },
      { prompt_number: 3, prompt_text: "What's something you notice that you want to know more about ?" },
    ],
  },
  {
    artwork_title: "The Drinkers",
    artist_name: "Vincent van Gogh",
    years: "1890",
    artwork_info:
      "Van Gogh made this in the asylum at Saint-Rémy, copying Daumier's dark satire on alcoholism and the ages of man. The greenish palette nods to absinthe, humor and horror in the same image.",
    image_s3_key: "courses/artwork/4650145e-fc39-4d92-b135-e8201297e107.jpg",
    prompts_json: [
      { prompt_number: 1, prompt_text: "How does this story open?" },
      { prompt_number: 2, prompt_text: "Tell us what happens next?" },
      { prompt_number: 3, prompt_text: "How might it end?" },
    ],
  },
  {
    artwork_title: "Fishing for Souls",
    artist_name: "Adriaen Pietersz van de Venne",
    years: "1614",
    artwork_info:
      "This 1614 painting makes its political allegiances crystal clear: on the left, Protestant ministers and Dutch Republic leaders bask in sunshine under leafy trees, while on the right, the Catholic-governed South (with archdukes and clergymen) languishes in shadow. The message is blunt: salvation, prosperity, and a bright future belong to those who swim toward the Protestant boats, a visual propaganda piece where theology, politics, and national identity merge into a single contested waterway.",
    image_s3_key: "courses/artwork/7d7aed33-2e0e-4b02-af63-60d4f3f9a774.jpg",
    prompts_json: [
      { prompt_number: 1, prompt_text: "How would you describe this image to someone else?" },
      { prompt_number: 2, prompt_text: "What details can you add to bring it to life for them?" },
      { prompt_number: 3, prompt_text: "What's the feeling here?" },
    ],
  },
  {
    artwork_title: "The Red Kerchief",
    artist_name: "Claude Monet",
    years: "1868–73",
    artwork_info:
      "Monet painted his first wife Camille glimpsed through the French doors of their Argenteuil home on a snowy day, her face rendered in rapid daubs of paint and her red cape the one vivid anchor in a world of white and green broken strokes. Monet kept this painting with him for his entire life.",
    image_s3_key: "courses/artwork/03d7325d-d738-4c6b-ba6b-b22a753e954c.jpg",
    prompts_json: [
      { prompt_number: 1, prompt_text: "Who or what is the main character here?" },
      { prompt_number: 2, prompt_text: "Why is that so?" },
      { prompt_number: 3, prompt_text: "How does that create the story?" },
    ],
  },
  {
    artwork_title: "Hunting near Hartenfels Castle",
    artist_name: "Lucas Cranach",
    years: "1540",
    artwork_info:
      "Commissioned by the Protestant rulers of Saxony, this teeming scene shows Elector John Frederick the Magnanimous spanning his crossbow in dark green hunting attire while his wife the Electress Sibylle stands poised for the first ceremonial shot, with their castle visible in the background. Cranach signed it with his trademark winged snake insignia at lower right, and the painting remained in the Royal Collection of Saxony for over four centuries before arriving at Cleveland.",
    image_s3_key: "courses/artwork/fb0c1462-2e9a-4e0b-8d4f-f20b61cf75ff.jpg",
    prompts_json: [
      { prompt_number: 1, prompt_text: "If this image was a book what would it be about?" },
      { prompt_number: 2, prompt_text: "How is this evident in the image?" },
      { prompt_number: 3, prompt_text: "Talk us through a second read." },
    ],
  },
  {
    artwork_title: "Basket of Plums",
    artist_name: "Anne Vallayer-Coster",
    years: "1769",
    artwork_info:
      "Vallayer-Coster arranges plums in a small canvas with the confidence of someone who had already proven she belonged in the Royal Academy, the fruit glowing in cool silvers and warm golds, a domestic abundance rendered with the precision and restraint that turns a basket into a meditation on color and light.",
    image_s3_key: "courses/artwork/79b9f1ba-46f9-4637-9507-d1f7250e16f2.jpg",
    prompts_json: [
      { prompt_number: 1, prompt_text: "Describe the mood of this image." },
      { prompt_number: 2, prompt_text: "Describe how this image would feel if it was an event." },
      { prompt_number: 3, prompt_text: "Describe its texture, flavor or sounds." },
    ],
  },
  {
    artwork_title:
      "The Dutton Family in the Drawing Room of Sherborne Park, Gloucestershire",
    artist_name: "Johann Zoffany",
    years: "c. 1772",
    artwork_info:
      "Zoffany depicts parents and their children playing cards in a country house, all dressed in mourning following the death of a loved one. This is an example of the conversation piece, the informal English genre of family portraiture Zoffany mastered.",
    image_s3_key: "courses/artwork/d29813c8-0087-4bcf-b716-68b8e512581c.jpg",
    prompts_json: [
      { prompt_number: 1, prompt_text: "Describe the front page story here." },
      { prompt_number: 2, prompt_text: "What's the real story behind it?" },
      { prompt_number: 3, prompt_text: "Is there a hidden story?" },
    ],
  },
  {
    artwork_title: "Two Sisters (On the Terrace)",
    artist_name: "Pierre-Auguste Renoir",
    years: "1881",
    artwork_info:
      "Renoir sets two figures in a blaze of spring color at Chatou, the older girl meeting our gaze with a composure that anchors the whole canvas while the younger one loses herself in her basket of wool, the painting so pleased with the world it describes that pleasure itself becomes the subject.",
    image_s3_key: "courses/artwork/822d1afd-0b57-4958-be98-81896d568093.jpg",
    prompts_json: [
      { prompt_number: 1, prompt_text: "Describe this image as if you're inside it." },
      { prompt_number: 2, prompt_text: "How do you feel?" },
      { prompt_number: 3, prompt_text: "Now try it again from outside the image." },
    ],
  },
  {
    artwork_title:
      "Sita asks Rama to fetch the golden deer from the Shangri Ramayana",
    artist_name: "Unknown Artist (Pahari Kingdoms)",
    years: "c. 1700–1725",
    artwork_info:
      "Painted in the Pahari hill kingdoms around 1700–1725, this intimate page from the Shangri Ramayana captures the pivotal moment when Sita, enchanted by the glittering creature, implores Rama to capture the golden deer, unaware it is the demon Maricha in disguise, sent by Ravana to lure Rama away.",
    image_s3_key: "courses/artwork/9f5085ed-9b4f-43da-90b8-f165e32dbf13.jpg",
    prompts_json: [
      { prompt_number: 1, prompt_text: "Look slowly and talk us through what you see." },
      { prompt_number: 2, prompt_text: "What's coming to mind as you look?" },
      { prompt_number: 3, prompt_text: "How does that show up in the image?" },
    ],
  },
  {
    artwork_title: "Women at a Table in a Room",
    artist_name: "Ernst Ludwig Kirchner",
    years: "1920",
    artwork_info:
      "Kirchner's jagged line and compressed space turn an ordinary interior into something angular and charged, the women at the table caught in that expressionist electric hum where everyday life and psychological unease are the same thing.",
    image_s3_key: "courses/artwork/e9989d6c-9557-49cb-9f47-03e05cbfb766.jpg",
    prompts_json: [
      { prompt_number: 1, prompt_text: "What or who is the subplot here?" },
      { prompt_number: 2, prompt_text: "What do they think or feel?" },
      { prompt_number: 3, prompt_text: "Now describe them as the main event." },
    ],
  },
];

module.exports = {
  async up(queryInterface) {
    // Idempotency guard — skip if any content already exists for these lessons
    const [existing] = await queryInterface.sequelize.query(
      `SELECT COUNT(*) as count FROM \`Lesson_Contents\` WHERE course_lesson_id IN (${STORYTELLER_LESSON_IDS.join(",")})`,
      { type: queryInterface.sequelize.QueryTypes.SELECT },
    );
    if (existing.count > 0) {
      console.log("[seed] Storyteller lesson contents already seeded — skipping.");
      return;
    }

    const now = new Date();

    const rows = CONTENTS.map((c, i) => ({
      course_lesson_id: STORYTELLER_LESSON_IDS[i],
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
    console.log(`[seed] Inserted ${rows.length} Storyteller lesson contents.`);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Lesson_Contents", {
      course_lesson_id: STORYTELLER_LESSON_IDS,
    });
  },
};
