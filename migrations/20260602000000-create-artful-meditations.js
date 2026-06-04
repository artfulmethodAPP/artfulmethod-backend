"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Artful_Meditations", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      archetype: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      artwork_title: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      artist_name: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      years: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      medium: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      dimensions: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      location: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      about_art: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      image_s3_key: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      audio_s3_key: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      audio_duration: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },
      sort_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Artful_Meditations");
  },
};
