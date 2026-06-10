"use strict";

/**
 * Seed: Update Framer session 3 title.
 * Renames the Framer (course_id = 2) lesson at sort_order 3 from
 * "The Comparison" to "The Long View".
 *
 * Run:  npx sequelize-cli db:seed --seed 20260602000012-update-framer-lesson3-title.js
 * Undo: npx sequelize-cli db:seed:undo --seed 20260602000012-update-framer-lesson3-title.js
 */

const COURSE_ID = 2; // The Framer
const SORT_ORDER = 3;
const NEW_TITLE = "The Long View";
const OLD_TITLE = "The Comparison";

async function setTitle(queryInterface, title) {
  const now = new Date();
  await queryInterface.sequelize.query(
    "UPDATE `Course_Lessons` SET title = :title, updated_at = :now WHERE course_id = :courseId AND sort_order = :sortOrder",
    {
      replacements: { title, now, courseId: COURSE_ID, sortOrder: SORT_ORDER },
      type: queryInterface.sequelize.QueryTypes.UPDATE,
    },
  );
}

module.exports = {
  async up(queryInterface) {
    await setTitle(queryInterface, NEW_TITLE);
    console.log(`[seed] Framer session ${SORT_ORDER} renamed to "${NEW_TITLE}".`);
  },

  async down(queryInterface) {
    await setTitle(queryInterface, OLD_TITLE);
    console.log(`[seed] Framer session ${SORT_ORDER} reverted to "${OLD_TITLE}".`);
  },
};
