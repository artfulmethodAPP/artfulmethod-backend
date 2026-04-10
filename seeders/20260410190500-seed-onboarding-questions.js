"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert("Onboarding_questions", [
      {
        key: "age_group",
        question_text: "Which age group do you belong to?",
        options: JSON.stringify([
          "18-24",
          "25-34",
          "35-44",
          "45-54",
          "55+",
        ]),
        created_at: now,
        updated_at: now,
      },
      {
        key: "daily_screen_time",
        question_text: "How many hours do you usually spend on screens each day?",
        options: JSON.stringify([
          "Less than 2 hours",
          "2-4 hours",
          "4-6 hours",
          "More than 6 hours",
        ]),
        created_at: now,
        updated_at: now,
      },
      {
        key: "primary_goal",
        question_text: "What is your primary goal for using this platform?",
        options: JSON.stringify([
          "Cognitive assessment",
          "Progress tracking",
          "Clinical follow-up",
          "General curiosity",
        ]),
        created_at: now,
        updated_at: now,
      },
      {
        key: "support_preference",
        question_text: "How would you prefer to receive support or follow-up?",
        options: JSON.stringify([
          "Email updates",
          "Phone call",
          "In-app notifications",
          "No follow-up needed",
        ]),
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete(
      "Onboarding_questions",
      {
        key: [
          "age_group",
          "daily_screen_time",
          "primary_goal",
          "support_preference",
        ],
      },
      {},
    );
  },
};
