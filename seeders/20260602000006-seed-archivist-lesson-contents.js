"use strict";

/**
 * Seed: Lesson_Contents — The Archivist
 * Seeds 10 lesson content rows for course_lesson_id 31–40 (The Archivist lessons).
 * Depends on: 20260516000001-seed-course-lessons.js
 * Idempotent — skips if any content already exists for lesson IDs 31–40.
 *
 * Run:  npx sequelize-cli db:seed --seed 20260602000006-seed-archivist-lesson-contents.js
 * Undo: npx sequelize-cli db:seed:undo --seed 20260602000006-seed-archivist-lesson-contents.js
 */

// course_lesson_id 31–40 map to CONTENTS[0..9] in order.
const ARCHIVIST_LESSON_IDS = [31, 32, 33, 34, 35, 36, 37, 38, 39, 40];

// One entry per Archivist lesson, in order (course_lesson_id 31..40).
// { artwork_title, artist_name, years, artwork_info, image_s3_key, prompts_json }
const CONTENTS = [
  {
    artwork_title: "Woman Reading a Letter",
    artist_name: "Johannes Vermeer",
    years: "c. 1663",
    artwork_info:
      "In this intimate 1663 painting, Vermeer captures a woman so absorbed in reading a letter that she hasn't even changed out of her blue night jacket. What makes this revolutionary is Vermeer's technique of painting light itself: he renders her skin in pale grey tones and shadows in light blue, capturing how morning illumination actually transforms color, turning an everyday moment of reading into a meditation on presence and privacy.",
    image_s3_key: "courses/artwork/78165fac-20d9-43ac-838e-2630b3f5aff1.jpg",
    prompts_json: [
      { prompt_number: 1, prompt_text: "What do you already know about this record?" },
      { prompt_number: 2, prompt_text: "What's still an open question?" },
      { prompt_number: 3, prompt_text: "Where would you look to find out?" },
    ],
  },
  {
    artwork_title: "Statue of the Madonna in the Mountains",
    artist_name: "Caspar David Friedrich",
    years: "1804",
    artwork_info:
      "Friedrich paints what he sees outside and within. A tiny pilgrim kneels before a Madonna statue on a distant peak, dwarfed by blank sky and silent hills, nature rendered as something as overwhelming and mysterious as existence itself.",
    image_s3_key: "courses/artwork/e049c01a-278d-4e14-bb02-52c6916c1410.jpg",
    prompts_json: [
      { prompt_number: 1, prompt_text: "What does this connect to in the wider archive?" },
      { prompt_number: 2, prompt_text: "Where does that connection lead?" },
      { prompt_number: 3, prompt_text: "What does it make you contextualise?" },
    ],
  },
  {
    artwork_title: "Dorothy True",
    artist_name: "Alfred Stieglitz",
    years: "1919",
    artwork_info:
      "Alfred Stieglitz's 1919 gelatin silver print captures Dorothy True, a young dancer in his circle. Made during the period when Stieglitz was turning toward intimate, psychologically charged portraiture, it reflects his belief that close study of a subject could reveal something a single sitting never would. Small and unadorned, the photograph is a quiet example of his commitment to photography as fine art.",
    image_s3_key: "courses/artwork/5743cbdc-f41a-4786-b681-e9ee37b4e3ab.jpg",
    prompts_json: [
      { prompt_number: 1, prompt_text: "What's happening in the image itself?" },
      { prompt_number: 2, prompt_text: "What was happening in the world that produced it?" },
      { prompt_number: 3, prompt_text: "What does it make you wonder?" },
    ],
  },
  {
    artwork_title: "Still Life with Lemon and Cut Glass",
    artist_name: "Maria Margaretha van Os",
    years: "1823–26",
    artwork_info:
      "On a small panel barely larger than a sheet of paper, Maria Margaretha van Os assembles a peeled lemon, a cut glass, a sprig of flowers, and a butterfly, and finds in their quiet company all the light and precision the subject requires.",
    image_s3_key: "courses/artwork/1bbe2ddf-396d-4657-b141-24e49c5f08e6.jpg",
    prompts_json: [
      { prompt_number: 1, prompt_text: "What's on the surface?" },
      { prompt_number: 2, prompt_text: "What context sits beneath it?" },
      { prompt_number: 3, prompt_text: "What larger history does it belong to?" },
    ],
  },
  {
    artwork_title: "The Feast of St Nicholas",
    artist_name: "Jan Havicksz. Steen",
    years: "1665–68",
    artwork_info:
      "A household mid-celebration and already sorting itself into winners and losers, the spoiled child clutching her gifts while her brother weeps over a shoe full of birch rods, Steen conducting the whole warm, chaotic scene with the eye of someone who found human nature endlessly, affectionately funny.",
    image_s3_key: "courses/artwork/c588367f-9c32-4036-ad0e-cab7653538a2.jpg",
    prompts_json: [
      { prompt_number: 1, prompt_text: "What does this image claim as fact?" },
      { prompt_number: 2, prompt_text: "Whose account does it carry?" },
      { prompt_number: 3, prompt_text: "Whose is absent from the record?" },
    ],
  },
  {
    artwork_title: "Maude Branscombe as Ophelia Floating in the Water",
    artist_name: "José Maria Mora",
    years: "c. 1880",
    artwork_info:
      "A photograph dressed up as painting, or a painting that remembers it was once a photograph, this studio portrait of an actress playing Ophelia turns Victorian theatricality into something genuinely strange, the water unconvincing and the stillness absolute.",
    image_s3_key: "courses/artwork/10323144-a5c7-48e5-a139-c3b4eacfb280.jpg",
    prompts_json: [
      { prompt_number: 1, prompt_text: "Gather everything this calls to mind." },
      { prompt_number: 2, prompt_text: "Sort it into categories." },
      { prompt_number: 3, prompt_text: "How do the categories relate and what do the gaps tell you?" },
    ],
  },
  {
    artwork_title: "The Courtyard of a House in Cairo",
    artist_name: "Willem de Famars Testas",
    years: "1868–81",
    artwork_info:
      "Sunlight organizes everything here, falling across the tiled courtyard with the unhurried authority of a place that has learned to live around heat, and Testas records it with the careful attention of a European who has stopped trying to impose a story on what he sees.",
    image_s3_key: "courses/artwork/ff18b848-c2f6-4dc9-92b4-9a9cfb618216.jpg",
    prompts_json: [
      { prompt_number: 1, prompt_text: "Who is documented here?" },
      { prompt_number: 2, prompt_text: "What is being recorded?" },
      { prompt_number: 3, prompt_text: "When where and why was this preserved?" },
    ],
  },
  {
    artwork_title: "The Herring Net",
    artist_name: "Winslow Homer",
    years: "1885",
    artwork_info:
      "Two fishermen haul their catch from a grey Atlantic swell, and Homer makes the labor feel as ancient and precarious as it is, the boat small against the water, the men bent to their work with a gravity that asks nothing from the viewer except to understand that this is how things have always been.",
    image_s3_key: "courses/artwork/29e137f6-f6f4-4ae6-9326-66f7ae40e329.jpg",
    prompts_json: [
      { prompt_number: 1, prompt_text: "Which interpretive lens are you bringing?" },
      { prompt_number: 2, prompt_text: "What would a different lens reveal?" },
      { prompt_number: 3, prompt_text: "And what might another?" },
    ],
  },
  {
    artwork_title: "The Eye Like a Strange Balloon Moves Toward Infinity",
    artist_name: "Odilon Redon",
    years: "1882",
    artwork_info:
      "The eye, like a strange balloon, moves toward infinity, a lithograph from Redon's homage to Edgar Poe in which a giant eyeball floats skyward like a balloon trailing a dish bearing a severed head, dream logic rendered with the solemn precision of a scientific illustration.",
    image_s3_key: "courses/artwork/d88a42fa-5ae4-44e8-92ec-59ba1f3ac58e.jpg",
    prompts_json: [
      { prompt_number: 1, prompt_text: "Look slowly and talk us through what you see." },
      { prompt_number: 2, prompt_text: "What's coming to mind as you look?" },
      { prompt_number: 3, prompt_text: "How does that show up in the work?" },
    ],
  },
  {
    artwork_title: "Enjoying an Evening Breeze at the Ryogoku Bridge",
    artist_name: "Utagawa Hiroshige",
    years: "1847–50",
    artwork_info:
      "This woodblock print from Hiroshige's \"Famous Places in the Eastern Capital\" series (1847–50) captures an ephemeral moment of leisure that the artist transformed into something timeless, a record of how ordinary people inhabited their city that has outlasted the world it depicts, becoming a meditation on presence and the quiet persistence of human experience across centuries.",
    image_s3_key: "courses/artwork/b007a69a-4d61-4dac-85f3-af449359d7db.jpg",
    prompts_json: [
      { prompt_number: 1, prompt_text: "What does this image choose to preserve?" },
      { prompt_number: 2, prompt_text: "Whose story does it hold?" },
      { prompt_number: 3, prompt_text: "What does it ask us to carry forward?" },
    ],
  },
];

module.exports = {
  async up(queryInterface) {
    // Idempotency guard — skip if any content already exists for these lessons
    const [existing] = await queryInterface.sequelize.query(
      `SELECT COUNT(*) as count FROM \`Lesson_Contents\` WHERE course_lesson_id IN (${ARCHIVIST_LESSON_IDS.join(",")})`,
      { type: queryInterface.sequelize.QueryTypes.SELECT },
    );
    if (existing.count > 0) {
      console.log("[seed] Archivist lesson contents already seeded — skipping.");
      return;
    }

    const now = new Date();

    const rows = CONTENTS.map((c, i) => ({
      course_lesson_id: ARCHIVIST_LESSON_IDS[i],
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
    console.log(`[seed] Inserted ${rows.length} Archivist lesson contents.`);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Lesson_Contents", {
      course_lesson_id: ARCHIVIST_LESSON_IDS,
    });
  },
};
