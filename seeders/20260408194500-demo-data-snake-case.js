"use strict";

const bcrypt = require("bcrypt");
const { QueryTypes } = require("sequelize");

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const hashedPassword = await bcrypt.hash("password123", 10);

    await queryInterface.bulkInsert("Users", [
      {
        name: "Seed Admin",
        email: "seed.admin@example.com",
        password: hashedPassword,
        role: "admin",
        gender: "male",
        is_verified: true,
        created_at: now,
        updated_at: now,
      },
      {
        name: "Seed User One",
        email: "seed.user.one@example.com",
        password: hashedPassword,
        role: "user",
        gender: "female",
        is_verified: true,
        created_at: now,
        updated_at: now,
      },
      {
        name: "Seed User Two",
        email: "seed.user.two@example.com",
        password: hashedPassword,
        role: "user",
        gender: "male",
        is_verified: true,
        created_at: now,
        updated_at: now,
      },
    ]);

    const [adminUser] = await queryInterface.sequelize.query(
      `
        SELECT id
        FROM Users
        WHERE email = :email
        LIMIT 1
      `,
      {
        replacements: { email: "seed.admin@example.com" },
        type: QueryTypes.SELECT,
      },
    );

    const [userOne] = await queryInterface.sequelize.query(
      `
        SELECT id
        FROM Users
        WHERE email = :email
        LIMIT 1
      `,
      {
        replacements: { email: "seed.user.one@example.com" },
        type: QueryTypes.SELECT,
      },
    );

    const [userTwo] = await queryInterface.sequelize.query(
      `
        SELECT id
        FROM Users
        WHERE email = :email
        LIMIT 1
      `,
      {
        replacements: { email: "seed.user.two@example.com" },
        type: QueryTypes.SELECT,
      },
    );

    await queryInterface.bulkInsert("Tasks", [
      {
        user_id: adminUser.id,
        title: "Seed Image Task",
        description: "Name the object shown in the image.",
        type: "image",
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        user_id: adminUser.id,
        title: "Seed Question Task",
        description: "Answer the onboarding assessment questions.",
        type: "question",
        is_active: true,
        created_at: now,
        updated_at: now,
      },
    ]);

    const [imageTask] = await queryInterface.sequelize.query(
      `
        SELECT id
        FROM Tasks
        WHERE title = :title
        ORDER BY id DESC
        LIMIT 1
      `,
      {
        replacements: { title: "Seed Image Task" },
        type: QueryTypes.SELECT,
      },
    );

    const [questionTask] = await queryInterface.sequelize.query(
      `
        SELECT id
        FROM Tasks
        WHERE title = :title
        ORDER BY id DESC
        LIMIT 1
      `,
      {
        replacements: { title: "Seed Question Task" },
        type: QueryTypes.SELECT,
      },
    );

    await queryInterface.bulkInsert("Task_Media", [
      {
        task_id: imageTask.id,
        image_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1000",
        created_at: now,
        updated_at: now,
      },
    ]);

    await queryInterface.bulkInsert("Task_Questions", [
      {
        task_id: questionTask.id,
        questions: JSON.stringify({
          1: "What is your full name?",
          2: "How are you feeling today?",
          3: "What city are you in right now?",
        }),
        created_at: now,
        updated_at: now,
      },
    ]);

    await queryInterface.bulkInsert("Task_Attempts", [
      {
        user_id: userOne.id,
        task_id: imageTask.id,
        created_at: now,
        updated_at: now,
      },
      {
        user_id: userTwo.id,
        task_id: questionTask.id,
        created_at: now,
        updated_at: now,
      },
    ]);

    const [imageAttempt] = await queryInterface.sequelize.query(
      `
        SELECT id
        FROM Task_Attempts
        WHERE user_id = :user_id AND task_id = :task_id
        ORDER BY id DESC
        LIMIT 1
      `,
      {
        replacements: { user_id: userOne.id, task_id: imageTask.id },
        type: QueryTypes.SELECT,
      },
    );

    const [questionAttempt] = await queryInterface.sequelize.query(
      `
        SELECT id
        FROM Task_Attempts
        WHERE user_id = :user_id AND task_id = :task_id
        ORDER BY id DESC
        LIMIT 1
      `,
      {
        replacements: { user_id: userTwo.id, task_id: questionTask.id },
        type: QueryTypes.SELECT,
      },
    );

    await queryInterface.bulkInsert("Task_Media_Responses", [
      {
        attempt_id: imageAttempt.id,
        voice_url: "https://example.com/audio/seed-object-answer.wav",
        transcript_text: "This looks like a smiling person.",
        duration_sec: 4,
        created_at: now,
        updated_at: now,
      },
    ]);

    await queryInterface.bulkInsert("Task_Question_Responses", [
      {
        attempt_id: questionAttempt.id,
        answer_text: JSON.stringify({
          "What is your full name?": "Seed User Two",
          "How are you feeling today?": "I feel focused.",
          "What city are you in right now?": "Karachi",
        }),
        created_at: now,
        updated_at: now,
      },
    ]);

    await queryInterface.bulkInsert("Ai_Reports", [
      {
        attempt_id: imageAttempt.id,
        pdf_url: "https://example.com/reports/seed-report.pdf",
        ai_response_url_link: "https://ai.example.com/v1/reports/seed-report",
        created_at: now,
        updated_at: now,
      },
    ]);

    const [report] = await queryInterface.sequelize.query(
      `
        SELECT id
        FROM Ai_Reports
        WHERE attempt_id = :attempt_id
        ORDER BY id DESC
        LIMIT 1
      `,
      {
        replacements: { attempt_id: imageAttempt.id },
        type: QueryTypes.SELECT,
      },
    );

    await queryInterface.bulkInsert("Email_logs", [
      {
        user_id: userOne.id,
        report_id: report.id,
        email: "seed.user.one@example.com",
        email_type: "report",
        subject: "Seed Assessment Report",
        status: "sent",
        sent_at: now,
        created_at: now,
        updated_at: now,
      },
    ]);

    await queryInterface.bulkInsert("Refresh_tokens", [
      {
        user_id: userOne.id,
        token_type: "refresh",
        token: "seed_refresh_token_string",
        is_revoked: false,
        expires_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete(
      "Refresh_tokens",
      {
        token: "seed_refresh_token_string",
      },
      {},
    );

    await queryInterface.bulkDelete(
      "Users",
      {
        email: [
          "seed.admin@example.com",
          "seed.user.one@example.com",
          "seed.user.two@example.com",
        ],
      },
      {},
    );
  },
};
