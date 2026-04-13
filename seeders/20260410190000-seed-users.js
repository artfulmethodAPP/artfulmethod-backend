"use strict";

const bcrypt = require("bcrypt");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const hashedPassword = await bcrypt.hash("Password123!", 10);

    await queryInterface.bulkInsert("Users", [
      {
        role: "admin",
        email: "admin@artfulmethod.com",
        password: hashedPassword,
        name: "Admin User",
        otp_code: null,
        otp_expires_at: null,
        is_verified: true,
        dob: "1990-01-15",
        gender: "male",
        goal: "Monitor baseline cognitive performance",
        source: "seed",
        art_frequency: "Everyday",
        created_at: now,
        updated_at: now,
        deleted_at: null,
      },
      {
        role: "user",
        email: "sarah.connor@artfulmethod.com",
        password: hashedPassword,
        name: "Sarah Connor",
        otp_code: null,
        otp_expires_at: null,
        is_verified: true,
        dob: "1993-06-21",
        gender: "female",
        goal: "Track weekly onboarding progress",
        source: "seed",
        art_frequency: "1-2 times a week",
        created_at: now,
        updated_at: now,
        deleted_at: null,
      },
      {
        role: "user",
        email: "alex.rivera@artfulmethod.com",
        password: hashedPassword,
        name: "Alex Rivera",
        otp_code: null,
        otp_expires_at: null,
        is_verified: true,
        dob: "1988-11-03",
        gender: "other",
        goal: "Complete initial assessment flow",
        source: "seed",
        art_frequency: "About once a month",
        created_at: now,
        updated_at: now,
        deleted_at: null,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete(
      "Users",
      {
        email: [
          "admin@artfulmethod.com",
          "sarah.connor@artfulmethod.com",
          "alex.rivera@artfulmethod.com",
        ],
      },
      {},
    );
  },
};
