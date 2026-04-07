"use strict";

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Email_logs", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      report_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Ai_Reports",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      email: {
        type: Sequelize.STRING(250),
        allowNull: false,
      },

      email_type: {
        type: Sequelize.ENUM("forgot-password", "report", "welcome", "otp"),
        allowNull: false,
      },

      subject: {
        type: Sequelize.STRING(250),
        allowNull: false,
      },

      status: {
        type: Sequelize.ENUM("sent", "failed"),
        allowNull: false,
        defaultValue: "sent",
      },

      error_message: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      sent_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Email_logs");
  },
};
