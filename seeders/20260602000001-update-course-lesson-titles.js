"use strict";

/**
 * Seed: Update lesson titles for Artist, Archivist, Framer, Storyteller (course_ids 4, 3, 2, 1)
 * Replaces the 10 existing lesson titles per course with the new ones.
 * Depends on: 20260516000001-seed-course-lessons.js (lessons must already exist)
 *
 * Run:  npx sequelize-cli db:seed --seed 20260602000001-update-course-lesson-titles.js
 * Undo: npx sequelize-cli db:seed:undo --seed 20260602000001-update-course-lesson-titles.js
 */

// course_id = 4
const ARTIST_NEW = [
  "Six and Six More",
  "The Longer You Look",
  "Think Feel Care",
  "Sticking Points",
  "Tug of War",
  "Beauty and Truth",
  "Underneath",
  "All the Meanings",
  "Thinking Out Loud",
  "Then I Looked Again",
];

const ARTIST_OLD = [
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
];

// course_id = 3
const ARCHIVIST_NEW = [
  "First Findings",
  "Tracing the Thread",
  "Made in Time",
  "The Record Beneath",
  "Whose Version?",
  "The Sorting Room",
  "The Keeper",
  "Through the Lens",
  "Thinking Out Loud",
  "What Endures",
];

const ARCHIVIST_OLD = [
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
];

// course_id = 2
const FRAMER_NEW = [
  "The Initial Assessment",
  "Testing the Theory",
  "The Comparison",
  "Evidence and Inference",
  "Degrees of Certainty",
  "The Structure",
  "Deconstruction",
  "The Mechanism",
  "Thinking Out Loud",
  "The Unresolved",
];

const FRAMER_OLD = [
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
];

// course_id = 1
const STORYTELLER_NEW = [
  "The Opening Scene",
  "The Story Arc",
  "The Narrator",
  "Who's Here",
  "The Cover Story",
  "The Mood Room",
  "Behind the Story",
  "Through the Fourth Wall",
  "Thinking Out Loud",
  "The Subplot",
];

const STORYTELLER_OLD = [
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
];

const COURSES = [
  { name: "The Artist",      courseId: 4, newTitles: ARTIST_NEW,      oldTitles: ARTIST_OLD },
  { name: "The Archivist",   courseId: 3, newTitles: ARCHIVIST_NEW,   oldTitles: ARCHIVIST_OLD },
  { name: "The Framer",      courseId: 2, newTitles: FRAMER_NEW,      oldTitles: FRAMER_OLD },
  { name: "The Storyteller", courseId: 1, newTitles: STORYTELLER_NEW, oldTitles: STORYTELLER_OLD },
];

async function updateTitles(queryInterface, courseId, titles) {
  const now = new Date();
  for (let i = 0; i < titles.length; i++) {
    await queryInterface.sequelize.query(
      "UPDATE `Course_Lessons` SET title = :title, updated_at = :now WHERE course_id = :courseId AND sort_order = :sortOrder",
      {
        replacements: { title: titles[i], now, courseId, sortOrder: i + 1 },
        type: queryInterface.sequelize.QueryTypes.UPDATE,
      },
    );
  }
}

module.exports = {
  async up(queryInterface) {
    for (const { name, courseId, newTitles } of COURSES) {
      await updateTitles(queryInterface, courseId, newTitles);
      console.log(`[seed] ${name} lesson titles updated.`);
    }
  },

  async down(queryInterface) {
    for (const { name, courseId, oldTitles } of COURSES) {
      await updateTitles(queryInterface, courseId, oldTitles);
      console.log(`[seed] ${name} lesson titles reverted.`);
    }
  },
};
