"use strict";

const bcrypt = require("bcrypt");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash("password123", 10);

    // 1. Users
    await queryInterface.bulkInsert("Users", [
      {
        id: 1,
        name: "Admin User",
        email: "admin@example.com",
        password: hashedPassword,
        role: "admin",
        gender: "male",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        name: "John Doe",
        email: "john@example.com",
        password: hashedPassword,
        role: "user",
        gender: "male",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 3,
        name: "Jane Smith",
        email: "jane@example.com",
        password: hashedPassword,
        role: "user",
        gender: "female",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // 2. Tasks
    await queryInterface.bulkInsert("Tasks", [
      {
        id: 1,
        user_id: 1,
        title: "Daily Object Recognition",
        description: "Identify common objects in the provided images.",
        type: "image",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        user_id: 1,
        title: "Cognitive Questions",
        description: "Answer basic cognitive assessment questions.",
        type: "question",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 3,
        user_id: 1,
        title: "Emotion Recognition",
        description: "What emotion do you see in this face?",
        type: "image",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // 3. Task_Media
    await queryInterface.bulkInsert("Task_Media", [
      {
        id: 1,
        task_id: 1,
        image_url: "https://images.unsplash.com/photo-1550258114-68bc7e454823?q=80&w=1000",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        task_id: 1,
        image_url: "https://images.unsplash.com/photo-1503602642458-232111445657?q=80&w=1000",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 3,
        task_id: 3,
        image_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // 4. Task_Question
    await queryInterface.bulkInsert("Task_Questions", [
      {
        id: 1,
        task_id: 2,
        questions: JSON.stringify({
          1: "What is your name?",
          2: "How are you feeling today?",
          3: "What is the date today?",
        }),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // 5. Task_Attempts
    await queryInterface.bulkInsert("Task_Attempts", [
      {
        id: 1,
        user_id: 2,
        task_id: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        user_id: 2,
        task_id: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // 6. Task_Media_Response
    await queryInterface.bulkInsert("Task_Media_Responses", [
      {
        id: 1,
        attempt_id: 1,
        voice_url: "https://example.com/audio/apple_response.wav",
        transcript_text: "This is an apple.",
        duration_sec: 5,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // 7. Task_Question_Response
    await queryInterface.bulkInsert("Task_Question_Responses", [
      {
        id: 1,
        attempt_id: 2,
        answer_text: JSON.stringify({
          "What is your name?": "John Doe",
          "How are you feeling today?": "I feel good.",
          "What is the date today?": "2026-03-30",
        }),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // 8. Ai_Reports
    await queryInterface.bulkInsert("Ai_Reports", [
      {
        id: 1,
        attempt_id: 1,
        pdf_url: "https://example.com/reports/report1.pdf",
        ai_response_url_link: "https://ai.example.com/v1/reports/1",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // 9. Email_logs
    await queryInterface.bulkInsert("Email_logs", [
      {
        id: 1,
        user_id: 2,
        report_id: 1,
        email: "john@example.com",
        email_type: "report",
        subject: "Your Assessment Report",
        status: "sent",
        sent_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // 10. Refresh_tokens
    await queryInterface.bulkInsert("Refresh_tokens", [
      {
        id: 1,
        user_id: 2,
        token_type: "refresh",
        token: "some_refresh_token_string",
        is_revoked: false,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Refresh_tokens", null, {});
    await queryInterface.bulkDelete("Email_logs", null, {});
    await queryInterface.bulkDelete("Ai_Reports", null, {});
    await queryInterface.bulkDelete("Task_Question_Responses", null, {});
    await queryInterface.bulkDelete("Task_Media_Responses", null, {});
    await queryInterface.bulkDelete("Task_Attempts", null, {});
    await queryInterface.bulkDelete("Task_Questions", null, {});
    await queryInterface.bulkDelete("Task_Media", null, {});
    await queryInterface.bulkDelete("Tasks", null, {});
    await queryInterface.bulkDelete("Users", null, {});
  },
};
