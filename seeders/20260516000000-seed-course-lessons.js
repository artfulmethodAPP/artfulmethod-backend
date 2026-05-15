"use strict";

/**
 * Seed: Course_Lessons
 * Reads lesson titles from the Excel data (HAMZAAll_Archetype_Courses.xlsx)
 * Requires courses to already exist with these exact names.
 *
 * Run:  npx sequelize-cli db:seed --seed 20260516000000-seed-course-lessons.js
 * Undo: npx sequelize-cli db:seed:undo --seed 20260516000000-seed-course-lessons.js
 */

// Lesson titles in sort_order (1–10) per course, sourced from Excel "Thinking Routine" column
const LESSONS_BY_COURSE = {
  "The Storyteller": [
    "See · Think · Wonder",
    "Beginning · Middle · End",
    "Zoom In",
    "Who Am I?",
    "Thinking with Images",
    "Colour · Symbol · Image",
    "The Story Routine: Main · Side · Hidden",
    "Step Inside",
    "VTS",
    "Circle of Viewpoints · BRIDGE toward Artist",
  ],
  "The Framer": [
    "What Makes You Say That?",
    "Does It Fit?",
    "Same and Different",
    "Facts or Fiction?",
    "Red Light · Yellow Light",
    "Colors · Shapes · Lines",
    "Parts · Purposes · Complexities",
    "The Explanation Game",
    "VTS",
    "Think · Puzzle · Explore · BRIDGE toward Archivist",
  ],
  "The Archivist": [
    "Think · Puzzle · Explore",
    "Connect · Extend · Challenge",
    "Here Now · There Then",
    "Layers",
    "True For Who?",
    "Generate · Sort · Connect · Elaborate",
    "Reporters Notebook",
    "Lenses for Dialogue",
    "Values · Identities · Actions",
    "Claim · Support · Question · BRIDGE toward Artist",
  ],
  "The Artist": [
    "Looking: Ten Times Two",
    "Slow Complexity Capture",
    "Think · Feel · Care",
    "Sticking Points",
    "Tug of War",
    "Beauty and Truth",
    "Peeling the Fruit",
    "Options Explosion",
    "VTS",
    "I Used to Think · Now I Think · BRIDGE toward Integrator",
  ],
  "The Integrator": [
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
  ],
};

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const courses = await queryInterface.sequelize.query(
      "SELECT id, name FROM `Courses` WHERE is_active = 1",
      { type: queryInterface.sequelize.QueryTypes.SELECT },
    );

    if (!courses.length) {
      throw new Error("No courses found. Create the 5 archetype courses first.");
    }

    const courseMap = {};
    for (const c of courses) courseMap[c.name] = c.id;

    const rows = [];

    for (const [courseName, titles] of Object.entries(LESSONS_BY_COURSE)) {
      const courseId = courseMap[courseName];
      if (!courseId) {
        console.warn(`[seed] Course not found: "${courseName}" — skipping`);
        continue;
      }
      titles.forEach((title, idx) => {
        rows.push({
          course_id: courseId,
          title,
          sort_order: idx + 1,
          is_active: true,
          created_at: now,
          updated_at: now,
        });
      });
    }

    if (!rows.length) throw new Error("No lesson rows to insert.");
    await queryInterface.bulkInsert("Course_Lessons", rows, {});
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      "DELETE cl FROM `Course_Lessons` cl INNER JOIN `Courses` c ON cl.course_id = c.id WHERE cl.sort_order BETWEEN 1 AND 10",
    );
  },
};
