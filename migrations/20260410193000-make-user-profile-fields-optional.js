"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Users", "name", {
      type: Sequelize.STRING(100),
      allowNull: true,
    });

    await queryInterface.changeColumn("Users", "dob", {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    await queryInterface.changeColumn("Users", "gender", {
      type: Sequelize.ENUM("male", "female", "other"),
      allowNull: true,
    });

    await queryInterface.changeColumn("Users", "goal", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn("Users", "source", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Users", "name", {
      type: Sequelize.STRING(100),
      allowNull: false,
    });

    await queryInterface.changeColumn("Users", "dob", {
      type: Sequelize.DATEONLY,
      allowNull: false,
    });

    await queryInterface.changeColumn("Users", "gender", {
      type: Sequelize.ENUM("male", "female", "other"),
      allowNull: false,
    });

    await queryInterface.changeColumn("Users", "goal", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    

    await queryInterface.changeColumn("Users", "source", {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};
