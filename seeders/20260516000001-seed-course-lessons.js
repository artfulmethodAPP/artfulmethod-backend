"use strict";

/**
 * Seed: Course_Lessons
 * Seeds 10 lessons per course (50 total).
 * Depends on: 20260516000000-seed-courses.js
 * Idempotent — skips if lessons already exist.
 *
 * Course IDs (actual DB values):
 *   1 = The Storyteller
 *   2 = The Framer
 *   3 = The Archivist
 *   4 = The Artist
 *   5 = The Integrator
 *
 * Run:  npx sequelize-cli db:seed --seed 20260516000001-seed-course-lessons.js
 * Undo: npx sequelize-cli db:seed:undo --seed 20260516000001-seed-course-lessons.js
 */

// [course_id, title] — sort_order = position in array (1-based)
// Course IDs: Integrator=5, Storyteller=1, Framer=2, Archivist=3, Artist=4
const LESSONS = [
  // ── The Integrator (course_id = 5) ────────────────────────────────────────
  [5, "Headlines"],
  [5, "What? · So What? · Now What?"],
  [5, "Making Meaning"],
  [5, "The 4 C's"],
  [5, "SAIL: Share · Ask · Ideas · Learned"],
  [5, "Reflect · Connect · Project"],
  [5, "The 3 Y's"],
  [5, "Step In · Step Out · Step Back"],
  [5, "See · Think · Me · We"],
  [5, "Making the Future · BRIDGE toward sustained practice"],

  // ── The Storyteller (course_id = 1) ───────────────────────────────────────
  [1, "See · Think · Wonder"],
  [1, "Beginning · Middle · End"],
  [1, "Zoom In"],
  [1, "Who Am I?"],
  [1, "Thinking with Images"],
  [1, "Colour · Symbol · Image"],
  [1, "The Story Routine: Main · Side · Hidden"],
  [1, "Step Inside"],
  [1, "VTS"],
  [1, "Circle of Viewpoints · BRIDGE toward Artist"],

  // ── The Framer (course_id = 2) ─────────────────────────────────────────────
  [2, "What Makes You Say That?"],
  [2, "Does It Fit?"],
  [2, "Same and Different"],
  [2, "Facts or Fiction?"],
  [2, "Red Light · Yellow Light"],
  [2, "Colors · Shapes · Lines"],
  [2, "Parts · Purposes · Complexities"],
  [2, "The Explanation Game"],
  [2, "VTS"],
  [2, "Think · Puzzle · Explore · BRIDGE toward Archivist"],

  // ── The Archivist (course_id = 3) ─────────────────────────────────────────
  [3, "Think · Puzzle · Explore"],
  [3, "Connect · Extend · Challenge"],
  [3, "Here Now · There Then"],
  [3, "Layers"],
  [3, "True For Who?"],
  [3, "Generate · Sort · Connect · Elaborate"],
  [3, "Reporters Notebook"],
  [3, "Lenses for Dialogue"],
  [3, "Values · Identities · Actions"],
  [3, "Claim · Support · Question · BRIDGE toward Artist"],

  // ── The Artist (course_id = 4) ─────────────────────────────────────────────
  [4, "Looking: Ten Times Two"],
  [4, "Slow Complexity Capture"],
  [4, "Think · Feel · Care"],
  [4, "Sticking Points"],
  [4, "Tug of War"],
  [4, "Beauty and Truth"],
  [4, "Peeling the Fruit"],
  [4, "Options Explosion"],
  [4, "VTS"],
  [4, "I Used to Think · Now I Think · BRIDGE toward Integrator"],
];

module.exports = {
  async up(queryInterface) {
    // Idempotency guard — skip if any lessons already exist for these courses
    const [existing] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) as count FROM `Course_Lessons` WHERE course_id IN (1,2,3,4,5)",
      { type: queryInterface.sequelize.QueryTypes.SELECT },
    );
    if (existing.count > 0) {
      console.log("[seed] Course lessons already seeded — skipping.");
      return;
    }

    const now = new Date();

    // Track sort_order per course independently
    const sortCounters = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    const rows = LESSONS.map(([courseId, title]) => {
      sortCounters[courseId] += 1;
      return {
        course_id: courseId,
        title,
        sort_order: sortCounters[courseId],
        is_active: true,
        created_at: now,
        updated_at: now,
      };
    });

    await queryInterface.bulkInsert("Course_Lessons", rows, {});
    console.log(`[seed] Inserted ${rows.length} lessons.`);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Course_Lessons", {
      course_id: [1, 2, 3, 4, 5],
    });
  },
};
