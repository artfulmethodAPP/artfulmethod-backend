"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Holds the user's "Get in touch" submissions as an array of
    // { message, time } objects. Each submission is appended. Users who never
    // submit feedback have an empty array (never null).
    await queryInterface.addColumn("Users", "feedback", {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: [],
    });

    // MySQL does not always apply a JSON column default to pre-existing rows,
    // so explicitly backfill any rows left NULL to an empty array.
    await queryInterface.sequelize.query(
      "UPDATE `Users` SET `feedback` = '[]' WHERE `feedback` IS NULL",
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Users", "feedback");
  },
};
