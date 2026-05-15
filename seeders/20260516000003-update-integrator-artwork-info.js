"use strict";

/**
 * Seed: Patch artwork_info on existing Integrator Lesson_Contents rows.
 * Targets rows by course_lesson_id (1–10) regardless of their auto-increment id.
 * Idempotent — safe to run multiple times.
 *
 * Run:  npx sequelize-cli db:seed --seed 20260516000003-update-integrator-artwork-info.js
 * Undo: npx sequelize-cli db:seed:undo --seed 20260516000003-update-integrator-artwork-info.js
 */

const ARTWORK_INFO = {
  1: "In 1890, American artist Robert Frederick Blum spent eighteen months in Japan creating illustrations for Scribner's Magazine, where he became fascinated by the ameya (candy blowers) — street artisans who shaped molten sugar like glassblowers, transforming a humble craft into what Blum described as work \"as artistic and finished as regards workmanship\" as any fine art, a recognition that beauty and mastery exist everywhere if we slow down enough to notice.",
  2: "Redon spent years working only in black and white — haunting charcoals and lithographs drawn from pure imagination. Then in the 1890s he discovered color through pastel, and everything shifted. This piece from around 1905 shows two figures sailing through a glowing, phosphorescent sea and sky. It feels like Redon replacing the dark turmoil of his earlier work with something luminous and hopeful — an internal voyage rendered in color.",
  3: "A solitary Norwegian cottage surrounded by forest and sea — Sohlberg painting an ordinary scene so attentively it becomes something transcendent. At the Art Institute of Chicago, public domain.",
  4: "Painted at twenty, with his own face in the crowd and his mother watching from the shadows, this early Rembrandt holds its meaning deliberately out of reach, the gathering either a hymn to God or a scene of seduction, and four centuries of looking have not settled the question.",
  5: "Caillebotte gives us Paris as a city that has just been invented, the wide new boulevards still feeling abstract and vertiginous, and two figures under an umbrella move through it with the particular self-possession of people who have learned to be alone together in public.",
  6: "Everything on this table has been used and not quite put away, the overturned glass and half-peeled lemon and dented cup arranged with the studied casualness of someone who understood that disorder, rendered with enough patience, becomes its own kind of beauty.",
  7: "Pissarro painted this sun-dappled forest scene of a sleeping man and a goat while living in poverty near Pontoise, applying pure-hued brushstrokes in systematic diagonal patterns he described as resembling knitting. It was shown at the fourth Impressionist exhibition in 1879 and now lives at the Cleveland Museum of Art.",
  8: "Liotard brings to his wife's portrait the same unsparing attention he gave to silk and velvet, and the result is a face so precisely observed that tenderness and scrutiny become impossible to tell apart.",
  9: "Henri Matisse's Woman Before an Aquarium (1921–23) depicts his model Henriette Darricarrère in quiet reverie, her gaze drawn downward toward a glass fishbowl set among pine cones and branches on a table, the scene's muted pinks and blues folding figure, still life, and decorated interior into one seamless, contemplative whole.",
  10: "Painted on the Seine with Signac at his side, this small canvas catches Van Gogh at the exact moment his palette was breaking open, the water rendered in lateral dabs of blue and lavender that are neither quite Impressionist nor yet fully his own, a picture of a man fishing and an artist discovering what he could do with color.",
};

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await Promise.all(
      Object.entries(ARTWORK_INFO).map(([lessonId, info]) =>
        queryInterface.sequelize.query(
          "UPDATE `Lesson_Contents` SET artwork_info = :info, updated_at = :now WHERE course_lesson_id = :lessonId",
          { replacements: { info, now, lessonId: parseInt(lessonId) } },
        ),
      ),
    );
    console.log("[seed] Patched artwork_info on 10 Integrator lesson content rows.");
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      "UPDATE `Lesson_Contents` SET artwork_info = NULL WHERE course_lesson_id IN (1,2,3,4,5,6,7,8,9,10)",
    );
  },
};
