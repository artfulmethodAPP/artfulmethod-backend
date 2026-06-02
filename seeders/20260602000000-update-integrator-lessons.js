"use strict";

/**
 * Seed: Update Integrator lesson titles (course_id = 5)
 * Replaces the 10 existing Integrator lesson titles with the new ones.
 * Depends on: 20260516000001-seed-course-lessons.js (lessons must already exist)
 *
 * Run:  npx sequelize-cli db:seed --seed 20260602000000-update-integrator-lessons.js
 * Undo: npx sequelize-cli db:seed:undo --seed 20260602000000-update-integrator-lessons.js
 */

const NEW_INTEGRATOR_TITLES = [
  "The Beginning of Something",
  "What's Alive Here",
  "The Edges of Meaning",
  "The Space Between",
  "What Wants to Emerge",
  "What It Reaches Toward",
  "Rippling Out",
  "The Wider Field",
  "Thinking Out Loud",
  "Holding the Possible",
];

const OLD_INTEGRATOR_TITLES = [
  "Headlines",
  "What? · So What? · Now What?",
  "Making Meaning",
  "The 4 C's",
  "SAIL: Share · Ask · Ideas · Learned",
  "Reflect · Connect · Project",
  "The 3 Y's",
  "Step In · Step Out · Step Back",
  "See · Think · Me · We",
  "Making the Future · BRIDGE toward sustained practice",
];

module.exports = {
  async up(queryInterface) {
    // Find the Integrator course id dynamically
    const [course] = await queryInterface.sequelize.query(
      "SELECT id FROM `Courses` WHERE name = 'The Integrator' LIMIT 1",
      { type: queryInterface.sequelize.QueryTypes.SELECT },
    );

    if (!course) {
      console.warn("[seed] Integrator course not found — skipping.");
      return;
    }

    const courseId = course.id;
    const now = new Date();

    for (let i = 0; i < NEW_INTEGRATOR_TITLES.length; i++) {
      const sortOrder = i + 1;
      const newTitle = NEW_INTEGRATOR_TITLES[i];

      await queryInterface.sequelize.query(
        "UPDATE `Course_Lessons` SET title = :title, updated_at = :now WHERE course_id = :courseId AND sort_order = :sortOrder",
        {
          replacements: { title: newTitle, now, courseId, sortOrder },
          type: queryInterface.sequelize.QueryTypes.UPDATE,
        },
      );
    }

    console.log("[seed] Integrator lesson titles updated.");
  },

  async down(queryInterface) {
    const [course] = await queryInterface.sequelize.query(
      "SELECT id FROM `Courses` WHERE name = 'The Integrator' LIMIT 1",
      { type: queryInterface.sequelize.QueryTypes.SELECT },
    );

    if (!course) {
      console.warn("[seed] Integrator course not found — skipping undo.");
      return;
    }

    const courseId = course.id;
    const now = new Date();

    for (let i = 0; i < OLD_INTEGRATOR_TITLES.length; i++) {
      const sortOrder = i + 1;
      const oldTitle = OLD_INTEGRATOR_TITLES[i];

      await queryInterface.sequelize.query(
        "UPDATE `Course_Lessons` SET title = :title, updated_at = :now WHERE course_id = :courseId AND sort_order = :sortOrder",
        {
          replacements: { title: oldTitle, now, courseId, sortOrder },
          type: queryInterface.sequelize.QueryTypes.UPDATE,
        },
      );
    }

    console.log("[seed] Integrator lesson titles reverted.");
  },
};
