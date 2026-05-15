"use strict";

/**
 * Seed: Lesson_Contents — The Integrator (course_id = 5)
 * Seeds 10 lesson content rows for course_lesson_id 1–10 (The Integrator lessons).
 * Depends on: 20260516000001-seed-course-lessons.js
 * Idempotent — skips if any content already exists for lesson IDs 1–10.
 *
 * Run:  npx sequelize-cli db:seed --seed 20260516000002-seed-integrator-lesson-contents.js
 * Undo: npx sequelize-cli db:seed:undo --seed 20260516000002-seed-integrator-lesson-contents.js
 */

// [course_lesson_id, artwork_title, artist_name, years, artwork_info, image_s3_key, prompts_json]
const CONTENTS = [
  [
    1,
    "The Ameya",
    "Robert Frederick Blum",
    "1857 - 1903",
    "In 1890, American artist Robert Frederick Blum spent eighteen months in Japan creating illustrations for Scribner's Magazine, where he became fascinated by the ameya (candy blowers) — street artisans who shaped molten sugar like glassblowers, transforming a humble craft into what Blum described as work \"as artistic and finished as regards workmanship\" as any fine art, a recognition that beauty and mastery exist everywhere if we slow down enough to notice.",
    "test-uploads/89738dcf-a719-4c73-bed2-46e4c951c1f4.jpg",
    [
      { prompt_number: 1, prompt_text: "If this image were a headline, what would it say?" },
      { prompt_number: 2, prompt_text: "What does that headline leave out?" },
      { prompt_number: 3, prompt_text: "What perspective or story does this headline shape?" },
    ],
  ],
  [
    2,
    "Flower Clouds",
    "Odilon Redon",
    "1840 - 1940",
    "Redon spent years working only in black and white — haunting charcoals and lithographs drawn from pure imagination. Then in the 1890s he discovered color through pastel, and everything shifted. This piece from around 1905 shows two figures sailing through a glowing, phosphorescent sea and sky. It feels like Redon replacing the dark turmoil of his earlier work with something luminous and hopeful — an internal voyage rendered in color.",
    "test-uploads/baa8b6be-07c2-4ca7-a5de-157c11116621.jpg",
    [
      { prompt_number: 1, prompt_text: "What is happening in this image?" },
      { prompt_number: 2, prompt_text: "So what does it matter?" },
      { prompt_number: 3, prompt_text: "Now what does it ask of you?" },
    ],
  ],
  [
    3,
    "Fisherman's Cottage",
    "Harald Oscar Sohlberg",
    "1869 - 1935",
    "A solitary Norwegian cottage surrounded by forest and sea — Sohlberg painting an ordinary scene so attentively it becomes something transcendent. At the Art Institute of Chicago, public domain.",
    "test-uploads/b4b8a56e-8f7c-4fb0-9532-d7808b1c1876.jpg",
    [
      { prompt_number: 1, prompt_text: "What meaning does this image hold for you personally?" },
      { prompt_number: 2, prompt_text: "What meaning might it hold more broadly?" },
      { prompt_number: 3, prompt_text: "How could this meaning influence the way people think or act?" },
    ],
  ],
  [
    4,
    "Musical Company",
    "Rembrandt van Rijn",
    "1606 - 1669",
    "Painted at twenty, with his own face in the crowd and his mother watching from the shadows, this early Rembrandt holds its meaning deliberately out of reach, the gathering either a hymn to God or a scene of seduction, and four centuries of looking have not settled the question.",
    "test-uploads/20d99977-c4d2-4647-838e-d9bded3146d5.jpg",
    [
      { prompt_number: 1, prompt_text: "What connections do you make?" },
      { prompt_number: 2, prompt_text: "What challenges does it raise?" },
      { prompt_number: 3, prompt_text: "What concepts and changes does it suggest?" },
    ],
  ],
  [
    5,
    "Paris Street; Rainy Day",
    "Gustave Caillebotte",
    "1848 - 1894",
    "Caillebotte gives us Paris as a city that has just been invented, the wide new boulevards still feeling abstract and vertiginous, and two figures under an umbrella move through it with the particular self-possession of people who have learned to be alone together in public.",
    "test-uploads/53cfdce8-ae0f-4a0d-90b7-d77a181a3ace.jpg",
    [
      { prompt_number: 1, prompt_text: "What would you share about this image?" },
      { prompt_number: 2, prompt_text: "What would you ask?" },
      { prompt_number: 3, prompt_text: "What ideas and new learning does it generate?" },
    ],
  ],
  [
    6,
    "Still Life with a Gilt Cup",
    "Rembrandt van Rijn",
    "1606 - 1669",
    "Everything on this table has been used and not quite put away, the overturned glass and half-peeled lemon and dented cup arranged with the studied casualness of someone who understood that disorder, rendered with enough patience, becomes its own kind of beauty.",
    "test-uploads/52a7eebb-cf2d-44fd-92c5-3c2b366c8b83.jpg",
    [
      { prompt_number: 1, prompt_text: "What do you reflect on when you look at this?" },
      { prompt_number: 2, prompt_text: "What does it connect to?" },
      { prompt_number: 3, prompt_text: "What does it project forward toward?" },
    ],
  ],
  [
    7,
    "Edge of the Woods Near L'Hermitage, Pontoise",
    "Camille Pissarro",
    "1830 - 1903",
    "Pissarro painted this sun-dappled forest scene of a sleeping man and a goat while living in poverty near Pontoise, applying pure-hued brushstrokes in systematic diagonal patterns he described as resembling knitting. It was shown at the fourth Impressionist exhibition in 1879 and now lives at the Cleveland Museum of Art.",
    "test-uploads/5d421ad3-3173-4f03-ac84-a3fe3f9ca87e.jpg",
    [
      { prompt_number: 1, prompt_text: "Why does this image matter to you?" },
      { prompt_number: 2, prompt_text: "Why might it matter to those around you?" },
      { prompt_number: 3, prompt_text: "Why might it matter to the world?" },
    ],
  ],
  [
    8,
    "Marie Fargues, the Painter's Wife",
    "Jean-Etienne Liotard",
    "1756 - 1758",
    "Liotard brings to his wife's portrait the same unsparing attention he gave to silk and velvet, and the result is a face so precisely observed that tenderness and scrutiny become impossible to tell apart.",
    "test-uploads/1b0cc963-01da-43b8-a195-6842ee2a368c.jpg",
    [
      { prompt_number: 1, prompt_text: "Step in: what do you see up close?" },
      { prompt_number: 2, prompt_text: "Step out: what do you see from a distance?" },
      { prompt_number: 3, prompt_text: "Step back: what is the whole picture?" },
    ],
  ],
  [
    9,
    "Woman before an Aquarium",
    "Henri Matisse",
    "1869 - 1954",
    "Henri Matisse's Woman Before an Aquarium (1921–23) depicts his model Henriette Darricarrère in quiet reverie, her gaze drawn downward toward a glass fishbowl set among pine cones and branches on a table, the scene's muted pinks and blues folding figure, still life, and decorated interior into one seamless, contemplative whole.",
    "test-uploads/e5d240cb-ec78-4e7f-90b1-933f3a7a0dc1.jpg",
    [
      { prompt_number: 1, prompt_text: "What do you see?" },
      { prompt_number: 2, prompt_text: "What do you think?" },
      { prompt_number: 3, prompt_text: "What does it mean to you, and what does it mean to us?" },
    ],
  ],
  [
    10,
    "Fishing in Spring, the Pont de Clichy",
    "Vincent van Gogh",
    "1853 - 1890",
    "Painted on the Seine with Signac at his side, this small canvas catches Van Gogh at the exact moment his palette was breaking open, the water rendered in lateral dabs of blue and lavender that are neither quite Impressionist nor yet fully his own, a picture of a man fishing and an artist discovering what he could do with color.",
    "test-uploads/e6aaf6e6-9c64-4974-b50f-c620b50098a3.jpg",
    [
      { prompt_number: 1, prompt_text: "What does this image suggest about what could be?" },
      { prompt_number: 2, prompt_text: "What small step could you take toward that?" },
      { prompt_number: 3, prompt_text: "How could this idea create long-term impact or change?" },
    ],
  ],
];

module.exports = {
  async up(queryInterface) {
    // Idempotency guard — skip if any content already exists for these lessons
    const [existing] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) as count FROM `Lesson_Contents` WHERE course_lesson_id IN (1,2,3,4,5,6,7,8,9,10)",
      { type: queryInterface.sequelize.QueryTypes.SELECT },
    );
    if (existing.count > 0) {
      console.log("[seed] Integrator lesson contents already seeded — skipping.");
      return;
    }

    const now = new Date();

    const rows = CONTENTS.map(([course_lesson_id, artwork_title, artist_name, years, image_s3_key, prompts_json]) => ({
      course_lesson_id,
      artwork_title,
      artist_name,
      years,
      image_s3_key,
      prompts_json: JSON.stringify(prompts_json),
      artwork_info: null,
      created_at: now,
      updated_at: now,
    }));

    await queryInterface.bulkInsert("Lesson_Contents", rows, {});
    console.log(`[seed] Inserted ${rows.length} Integrator lesson contents.`);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Lesson_Contents", {
      course_lesson_id: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    });
  },
};
