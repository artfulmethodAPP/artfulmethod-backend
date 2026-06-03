"use strict";

/**
 * Seed: Lesson_Contents — The Artist
 * Seeds 10 lesson content rows for course_lesson_id 41–50 (The Artist lessons).
 * Depends on: 20260516000001-seed-course-lessons.js
 * Idempotent — skips if any content already exists for lesson IDs 41–50.
 *
 * Run:  npx sequelize-cli db:seed --seed 20260602000005-seed-artist-lesson-contents.js
 * Undo: npx sequelize-cli db:seed:undo --seed 20260602000005-seed-artist-lesson-contents.js
 */

// course_lesson_id 41–50 map to CONTENTS[0..9] in order.
const ARTIST_LESSON_IDS = [41, 42, 43, 44, 45, 46, 47, 48, 49, 50];

// One entry per Artist lesson, in order (course_lesson_id 41..50).
// { artwork_title, artist_name, years, artwork_info, image_s3_key, prompts_json }
const CONTENTS = [
  {
    artwork_title: "The Buddha's Nirvāṇa",
    artist_name: "Lu Xinzhong",
    years: "13th century",
    artwork_info:
      "In this intimate 1663 painting, Vermeer captures a woman so absorbed in reading a letter that she hasn't even changed out of her blue night jacket. What makes this revolutionary is Vermeer's technique of painting light itself: he renders her skin in pale grey tones and shadows in light blue, capturing how morning illumination actually transforms color, turning an everyday moment of reading into a meditation on presence and privacy.",
    image_s3_key: "courses/artwork/5dd509e1-61e3-44ed-9085-25b0574b8779.jpg",
    prompts_json: [
      { prompt_number: 1, prompt_text: "Start with six things you see." },
      { prompt_number: 2, prompt_text: "Look again and find six more." },
      { prompt_number: 3, prompt_text: "What six only appeared with time?" },
    ],
  },
  {
    artwork_title: "Improvisation No. 30 (Cannons)",
    artist_name: "Wassily Kandinsky",
    years: "1913",
    artwork_info:
      "Friedrich paints what he sees outside and within. A tiny pilgrim kneels before a Madonna statue on a distant peak, dwarfed by blank sky and silent hills, nature rendered as something as overwhelming and mysterious as existence itself.",
    image_s3_key: "courses/artwork/7f57e00b-46a4-4927-a277-e3ecd1cd4e1f.jpg",
    prompts_json: [
      { prompt_number: 1, prompt_text: "What's your first read?" },
      { prompt_number: 2, prompt_text: "What layers open the longer you stay with it?" },
      { prompt_number: 3, prompt_text: "What does sustained attention reveal that quick looking cannot?" },
    ],
  },
  {
    artwork_title: "Branch of the Seine near Giverny (Mist)",
    artist_name: "Claude Monet",
    years: "1897",
    artwork_info:
      "Alfred Stieglitz's 1919 gelatin silver print captures Dorothy True, a young dancer in his circle. Made during the period when Stieglitz was turning toward intimate, psychologically charged portraiture, it reflects his belief that close study of a subject could reveal something a single sitting never would. Small and unadorned, the photograph is a quiet example of his commitment to photography as fine art.",
    image_s3_key: "courses/artwork/8af95d68-6c81-4db9-9cf9-414be20834d1.jpg",
    prompts_json: [
      { prompt_number: 1, prompt_text: "What do you feel as you look?" },
      { prompt_number: 2, prompt_text: "What does it stir or disturb in you?" },
      { prompt_number: 3, prompt_text: "What do you find yourself caring about?" },
    ],
  },
  {
    artwork_title: "Still Life with Asparagus",
    artist_name: "Adriaen Coorte",
    years: "1697",
    artwork_info:
      "On a small panel barely larger than a sheet of paper, Maria Margaretha van Os assembles a peeled lemon, a cut glass, a sprig of flowers, and a butterfly, and finds in their quiet company all the light and precision the subject requires.",
    image_s3_key: "courses/artwork/a0be8162-4600-4f09-af3d-1748c4af5274.jpg",
    prompts_json: [
      { prompt_number: 1, prompt_text: "Where does your eye keep returning?" },
      { prompt_number: 2, prompt_text: "What is that pull telling you?" },
      { prompt_number: 3, prompt_text: "What might inspire you to follow that pull deeper?" },
    ],
  },
  {
    artwork_title: "Portrait of Marie Jeanette de Lange",
    artist_name: "Jan Toorop",
    years: "1900",
    artwork_info:
      "A household mid-celebration and already sorting itself into winners and losers, the spoiled child clutching her gifts while her brother weeps over a shoe full of birch rods, Steen conducting the whole warm, chaotic scene with the eye of someone who found human nature endlessly, affectionately funny.",
    image_s3_key: "courses/artwork/5bac1a72-464a-427b-b009-0417c609d63b.jpg",
    prompts_json: [
      { prompt_number: 1, prompt_text: "What tension lives in this work?" },
      { prompt_number: 2, prompt_text: "What pulls you toward it?" },
      { prompt_number: 3, prompt_text: "What pulls you back?" },
    ],
  },
  {
    artwork_title: "At the Moulin Rouge",
    artist_name: "Henri de Toulouse-Lautrec",
    years: "1892–95",
    artwork_info:
      "A photograph dressed up as painting, or a painting that remembers it was once a photograph, this studio portrait of an actress playing Ophelia turns Victorian theatricality into something genuinely strange, the water unconvincing and the stillness absolute.",
    image_s3_key: "courses/artwork/c65deec7-b2fd-43e9-8f1d-6e750d437dd1.jpg",
    prompts_json: [
      { prompt_number: 1, prompt_text: "What is beautiful here?" },
      { prompt_number: 2, prompt_text: "What feels emotionally true?" },
      { prompt_number: 3, prompt_text: "Where do the two sit in tension?" },
    ],
  },
  {
    artwork_title: "A Sunday on La Grande Jatte 1884",
    artist_name: "Georges Seurat",
    years: "1884–86",
    artwork_info:
      "Sunlight organizes everything here, falling across the tiled courtyard with the unhurried authority of a place that has learned to live around heat, and Testas records it with the careful attention of a European who has stopped trying to impose a story on what he sees.",
    image_s3_key: "courses/artwork/9d0879ef-749f-4f5d-8ee2-22a14d42f640.jpg",
    prompts_json: [
      { prompt_number: 1, prompt_text: "What mood sits on the surface?" },
      { prompt_number: 2, prompt_text: "What current runs beneath it?" },
      { prompt_number: 3, prompt_text: "What's at the deepest layer?" },
    ],
  },
  {
    artwork_title: "Self-portrait in a Cap Wide-eyed and Open-mouthed",
    artist_name: "Rembrandt van Rijn",
    years: "1630",
    artwork_info:
      "Two fishermen haul their catch from a grey Atlantic swell, and Homer makes the labor feel as ancient and precarious as it is, the boat small against the water, the men bent to their work with a gravity that asks nothing from the viewer except to understand that this is how things have always been.",
    image_s3_key: "courses/artwork/a7cf7df0-1abb-4fd7-8d32-e39e8474a509.jpg",
    prompts_json: [
      { prompt_number: 1, prompt_text: "What readings does this work hold?" },
      { prompt_number: 2, prompt_text: "Which one feels most alive to you?" },
      { prompt_number: 3, prompt_text: "What does that choice reveal about how you see this image?" },
    ],
  },
  {
    artwork_title:
      "Oudezijds Achterburgwal and on the left the Rear Side of the Zeedijk",
    artist_name: "George Hendrik Breitner",
    years: "1894–1898",
    artwork_info:
      "The eye, like a strange balloon, moves toward infinity, a lithograph from Redon's homage to Edgar Poe in which a giant eyeball floats skyward like a balloon trailing a dish bearing a severed head, dream logic rendered with the solemn precision of a scientific illustration.",
    image_s3_key: "courses/artwork/c6205e7d-f8e5-4d0e-8ef9-f1bb57f522d3.jpg",
    prompts_json: [
      { prompt_number: 1, prompt_text: "Look slowly and talk us through what you see." },
      { prompt_number: 2, prompt_text: "What's coming to mind as you look?" },
      { prompt_number: 3, prompt_text: "How does that show up in the work?" },
    ],
  },
  {
    artwork_title: "Maharana Bhim Singh in Procession",
    artist_name: "Ghasi",
    years: "1815–25",
    artwork_info:
      "Hiroshige captures an ordinary summer evening transformed by the simple act of slowing down, people scattered across the Ryogoku Bridge catching the first cool air of nightfall, the composition angled from above so the bridge becomes both gathering place and vantage point, rendering leisure as a form of presence where color, distance, and human attention converge into something luminous and still.",
    image_s3_key: "courses/artwork/542d7ac6-62ca-466e-9e34-6d637b50ccfe.jpg",
    prompts_json: [
      { prompt_number: 1, prompt_text: "What did you feel when you first saw this?" },
      { prompt_number: 2, prompt_text: "What do you feel now?" },
      { prompt_number: 3, prompt_text: "What shifted?" },
    ],
  },
];

module.exports = {
  async up(queryInterface) {
    // Idempotency guard — skip if any content already exists for these lessons
    const [existing] = await queryInterface.sequelize.query(
      `SELECT COUNT(*) as count FROM \`Lesson_Contents\` WHERE course_lesson_id IN (${ARTIST_LESSON_IDS.join(",")})`,
      { type: queryInterface.sequelize.QueryTypes.SELECT },
    );
    if (existing.count > 0) {
      console.log("[seed] Artist lesson contents already seeded — skipping.");
      return;
    }

    const now = new Date();

    const rows = CONTENTS.map((c, i) => ({
      course_lesson_id: ARTIST_LESSON_IDS[i],
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
    console.log(`[seed] Inserted ${rows.length} Artist lesson contents.`);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Lesson_Contents", {
      course_lesson_id: ARTIST_LESSON_IDS,
    });
  },
};
