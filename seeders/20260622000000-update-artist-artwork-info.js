"use strict";

/**
 * Seed: Patch artwork_info on existing Artist Lesson_Contents rows.
 * Targets rows by course_lesson_id (41–50) regardless of their auto-increment id.
 * Replaces the previously-mismatched descriptions with the correct artwork_info,
 * each describing the actual artwork seeded for that lesson.
 * Idempotent — safe to run multiple times.
 *
 * Run:  npx sequelize-cli db:seed --seed 20260622000000-update-artist-artwork-info.js
 * Undo: npx sequelize-cli db:seed:undo --seed 20260622000000-update-artist-artwork-info.js
 */

// course_lesson_id 41..50 map to the Artist artworks in order.
const ARTWORK_INFO = {
  41: "Lu Xinzhong gathers the whole grieving world around the reclining Buddha, disciples and lay mourners and animals pressed close in open distress, while the one figure at the center stays perfectly still, so the painting becomes a quiet study of who death actually disturbs, which turns out to be everyone except the one it happens to.",
  42: "Kandinsky saw music and painting as parallel paths to abstraction, freeing color and line from representation. His 'improvisations' (1910 to 14) were meant as spontaneous, unconscious expressions. Of this painting he said the cannons may reflect the constant war talk of the time, but the real content is what the viewer experiences through form and color alone.",
  43: "Monet rowed out before dawn to the same spot on the Seine, painting 14 canvases at once as the light shifted. The nearly square format splits the scene between land and reflection, deliberately blurring where one ends and the other begins.",
  44: "A small bundle of asparagus on a stone ledge, nothing more, and Coorte makes it feel like an argument that the whole world of Dutch still life had been overcomplicating things all along.",
  45: "Toorop wraps his sitter in the sinuous grammar of Art Nouveau but leaves her face to resist it, clear and direct amid all the decorative turbulence, a person refusing to become an ornament.",
  46: "Toulouse-Lautrec paints himself into the background, a small figure in a top hat beside his much taller cousin, while the foreground belongs to a woman whose face is raked by gaslight into something verging on a mask, the whole painting less a celebration of Montmartre nightlife than a clear-eyed account of what it actually felt like to be inside it.",
  47: "Seurat spent two years applying his theory of color dot by dot to a canvas the size of a wall, and the result is a summer afternoon on the Seine that feels simultaneously sunlit and frozen, every figure locked in its own stillness as if leisure itself had become a discipline.",
  48: "A face caught in the act of feeling something extreme, mouth open, eyes wide, Rembrandt using his own reflection not to flatter or commemorate but to study what a human face looks like when it forgets to compose itself.",
  49: "Breitner treated his camera the way other painters treated a sketchbook, and this rain-grey canal view of the Oudezijds Achterburgwal has the unstudied authority of a city caught before it knew it was being looked at.",
  50: "Ghasi places the Maharana in strict profile at the heart of his own procession, the gold ground and the orderly retinue arranging themselves around him so completely that the painting reads less as a record of a journey than as a diagram of rank, every figure sized and spaced to show exactly how far it stands from the king.",
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
    console.log("[seed] Patched artwork_info on 10 Artist lesson content rows.");
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      "UPDATE `Lesson_Contents` SET artwork_info = NULL WHERE course_lesson_id IN (41,42,43,44,45,46,47,48,49,50)",
    );
  },
};
