"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      `UPDATE Lesson_Contents
       SET image_s3_key = 'test-uploads/93477d71-b674-45c9-82e1-e4c872ac82c6.jpg'
       WHERE course_lesson_id = 7`,
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      `UPDATE Lesson_Contents
       SET image_s3_key = 'test-uploads/5d421ad3-3173-4f03-ac84-a3fe3f9ca87e.jpg'
       WHERE course_lesson_id = 7`,
    );
  },
};
