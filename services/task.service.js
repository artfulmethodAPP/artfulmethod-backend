const { Task, TaskMedia, TaskQuestion, sequelize } = require("../models");

const createTask = async (data) => {
  const transaction = await sequelize.transaction();
  try {
    const { title, description, type, user_id, image_url, questions } = data;

    // Create the task entry
    const task = await Task.create(
      {
        title,
        description,
        type,
        user_id: parseInt(user_id, 10),
      },
      { transaction }
    );

    // Depending on type, create associated entry
    if (type === "image") {
      if (!image_url) {
        throw new Error("Missing image upload for image task.");
      }
      await TaskMedia.create(
        {
          task_id: task.id,
          image_url,
        },
        { transaction }
      );
    } else if (type === "question") {
      if (!questions) {
        throw new Error("Missing questions field for question task.");
      }

      const parsedQuestions = typeof questions === "string" ? JSON.parse(questions) : questions;

      await TaskQuestion.create(
        {
          task_id: task.id,
          questions: parsedQuestions,
        },
        { transaction }
      );
    } else {
      throw new Error("Invalid task type.");
    }

    const createdTask = await Task.findByPk(task.id, {
      include: [
        { model: TaskMedia },
        { model: TaskQuestion },
      ],
      transaction,
    });

    await transaction.commit();

    return createdTask;
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    throw error;
  }
};

module.exports = { createTask };
