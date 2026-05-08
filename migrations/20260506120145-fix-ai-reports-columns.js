"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable("Ai_Reports");

    if (!tableDescription.user_id) {
      await queryInterface.addColumn("Ai_Reports", "user_id", {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      });
    }

    await queryInterface.changeColumn("Ai_Reports", "pdf_url", {
      type: Sequelize.STRING(500),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Ai_Reports", "user_id");
    await queryInterface.changeColumn("Ai_Reports", "pdf_url", {
      type: Sequelize.STRING(250),
      allowNull: true,
    });
  },
};
