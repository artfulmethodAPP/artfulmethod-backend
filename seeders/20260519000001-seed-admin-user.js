"use strict";

const bcrypt = require("bcrypt");

/**
 * Seed: Admin user — sheikhuzairraza834@gmail.com
 * Idempotent — skips if email already exists.
 *
 * Run:  npx sequelize-cli db:seed --seed 20260519000001-seed-admin-user.js
 * Undo: npx sequelize-cli db:seed:undo --seed 20260519000001-seed-admin-user.js
 */

const ADMIN_EMAIL = "hamzaali4942@gmail.com";

module.exports = {
  async up(queryInterface) {
    const [existing] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) as count FROM `Users` WHERE email = :email",
      { replacements: { email: ADMIN_EMAIL }, type: queryInterface.sequelize.QueryTypes.SELECT },
    );
    if (existing.count > 0) {
      console.log("[seed] Admin user already exists — skipping.");
      return;
    }

    const hashedPassword = await bcrypt.hash("Abc@12345", 10);
    const now = new Date();

    await queryInterface.bulkInsert("Users", [
      {
        role: "admin",
        email: ADMIN_EMAIL,
        password:
          "$2b$10$vz0aidEqMMx9Ka66hV4EN.tvYYleJCTHh.cvGA2ftifdxaLBd/hYy",
        name: "Hamza Ali",
        otp_code: null,
        otp_expires_at: null,
        is_verified: true,
        dob: "1990-01-01",
        gender: "male",
        goal: "Platform administration",
        source: "seed",
        art_frequency: "Everyday",
        streak_count: 0,
        last_activity_date: null,
        home_base_course_id: null,
        email_reports_enabled: true,
        deleted_at: null,
        created_at: now,
        updated_at: now,
      },
    ]);

    console.log(`[seed] Admin user created: ${ADMIN_EMAIL}`);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Users", { email: ADMIN_EMAIL }, {});
  },
};
