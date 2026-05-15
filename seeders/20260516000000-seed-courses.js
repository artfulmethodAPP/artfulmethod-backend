"use strict";

/**
 * Seed: Courses
 * Seeds the 5 Aesthetic Archetype courses exactly as defined in the course data.
 * image_s3_key is null — upload images via the admin API after seeding.
 *
 * Run:  npx sequelize-cli db:seed --seed 20260516000000-seed-courses.js
 * Undo: npx sequelize-cli db:seed:undo --seed 20260516000000-seed-courses.js
 */

module.exports = {
  async up(queryInterface) {
    const existing = await queryInterface.sequelize.query(
      "SELECT COUNT(*) as count FROM `Courses` WHERE name IN ('The Storyteller','The Framer','The Archivist','The Artist','The Integrator')",
      { type: queryInterface.sequelize.QueryTypes.SELECT },
    );
    if (existing[0].count > 0) {
      console.log("[seed] Courses already seeded — skipping.");
      return;
    }

    const now = new Date();

    await queryInterface.bulkInsert("Courses", [
      {
        name: "The Storyteller",
        subtitle: "NARRATIVE MAKER",
        description:
          "Find the narrative thread. Learn to weave observation into compelling stories and meaning.",
        image_s3_key:
          "courses/artwork/82e48104-9d53-421d-be71-d27f9f80f0b1.svg",
        sort_order: 2,
        is_active: 1,
        created_at: now,
        updated_at: now,
      },
      {
        name: "The Framer",
        subtitle: "STRUCTURE SEEKER",
        description:
          "Build frameworks and systems. Unlock this archetype after completing Storyteller.",
        image_s3_key:
          "courses/artwork/61048dad-04cd-4da8-85bf-a70b53d489dc.svg",
        sort_order: 3,
        is_active: 1,
        created_at: now,
        updated_at: now,
      },
      {
        name: "The Archivist",
        subtitle: "CONTEXT BUILDER",
        description:
          "Master context and historical patterns. Deepen your perceptual range with archival thinking.",
        image_s3_key:
          "courses/artwork/1b6a37fa-13ef-419a-996e-76254302a800.svg",
        sort_order: 4,
        is_active: 1,
        created_at: now,
        updated_at: now,
      },
      {
        name: "The Artist",
        subtitle: "Emotional explorer",
        description:
          "Stay with what they feel before you explain it. Let meaning emerge through attention, not conclusions.",
        image_s3_key:
          "courses/artwork/3a3c3e53-f216-4f55-a11f-8bfd73d876c1.svg",
        sort_order: 5,
        is_active: 1,
        created_at: now,
        updated_at: now,
      },
      {
        name: "The Integrator",
        subtitle: "Pattern seeker",
        description:
          "Simultaneously hold the personal and universal. Master the art of synthesis and connection-making.",
        image_s3_key:
          "courses/artwork/18f2043d-ff1e-4f0a-82e3-02fa71efb84b.svg",
        sort_order: 1,
        is_active: 1,
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Courses", {
      name: [
        "The Storyteller",
        "The Framer",
        "The Archivist",
        "The Artist",
        "The Integrator",
      ],
    });
  },
};
