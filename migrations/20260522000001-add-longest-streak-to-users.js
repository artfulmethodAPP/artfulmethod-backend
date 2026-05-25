"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Users", "longest_streak", {
      type:         Sequelize.INTEGER,
      allowNull:    false,
      defaultValue: 0,
      after:        "streak_count",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Users", "longest_streak");
  },
};
