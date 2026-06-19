"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Add "contact" to the Email_logs.email_type ENUM for "Get in touch" emails.
    await queryInterface.sequelize.query(
      "ALTER TABLE `Email_logs` MODIFY COLUMN `email_type` ENUM('forgot-password','report','welcome','otp','contact') NOT NULL",
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      "ALTER TABLE `Email_logs` MODIFY COLUMN `email_type` ENUM('forgot-password','report','welcome','otp') NOT NULL",
    );
  },
};
