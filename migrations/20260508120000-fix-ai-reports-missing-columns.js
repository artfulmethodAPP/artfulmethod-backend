"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable("Ai_Reports");

    // Clear stale test rows so FK constraint can be added cleanly
    await queryInterface.bulkDelete("Ai_Reports", null, {});

    if (!tableDescription.user_id) {
      await queryInterface.addColumn("Ai_Reports", "user_id", {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      });
    }

    if (!tableDescription.pdf_s3_key) {
      await queryInterface.addColumn("Ai_Reports", "pdf_s3_key", {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const tableDescription = await queryInterface.describeTable("Ai_Reports");

    if (tableDescription.pdf_s3_key) {
      await queryInterface.removeColumn("Ai_Reports", "pdf_s3_key");
    }

    if (tableDescription.user_id) {
      await queryInterface.removeColumn("Ai_Reports", "user_id");
    }
  },
};
