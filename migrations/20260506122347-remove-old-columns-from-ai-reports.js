"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable("Ai_Reports");

    if (tableDescription.attempt_id) {
      await queryInterface.removeColumn("Ai_Reports", "attempt_id");
    }

    if (tableDescription.ai_response_url_link) {
      await queryInterface.removeColumn("Ai_Reports", "ai_response_url_link");
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("Ai_Reports", "attempt_id", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    await queryInterface.addColumn("Ai_Reports", "ai_response_url_link", {
      type: Sequelize.STRING(500),
      allowNull: true,
    });
  },
};
