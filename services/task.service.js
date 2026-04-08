const { Task, TaskMedia, TaskQuestion, sequelize } = require("../models");
const AppError = require("../utils/app-error");

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
      { transaction },
    );

    // Depending on type, create associated entry
    if (type === "image") {
      if (!image_url) {
        throw new AppError(
          "Missing image upload for image task.",
          400,
          "VALIDATION_ERROR",
        );
      }
      await TaskMedia.create(
        {
          task_id: task.id,
          image_url,
        },
        { transaction },
      );
    } else if (type === "question") {
      if (!questions) {
        throw new AppError(
          "Missing questions field for question task.",
          400,
          "VALIDATION_ERROR",
        );
      }

      const parsedQuestions =
        typeof questions === "string" ? JSON.parse(questions) : questions;

      await TaskQuestion.create(
        {
          task_id: task.id,
          questions: parsedQuestions,
        },
        { transaction },
      );
    } else {
      throw new AppError("Invalid task type.", 400, "VALIDATION_ERROR");
    }

    const createdTask = await Task.findByPk(task.id, {
      include: [{ model: TaskMedia }, { model: TaskQuestion }],
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

const getAllTasks = async (filter = {}) => {
  const { type, is_active, isAdmin } = filter;
  const where = {};

  if (type) {
    where.type = type;
  }

  if (is_active !== undefined) {
    where.is_active = is_active;
  }

  const tasks = await Task.findAll({
    where,
    include: [{ model: TaskMedia }, { model: TaskQuestion }],
    order: [["created_at", "DESC"]],
    paranoid: !isAdmin, // Admins can include soft-deleted records when needed
  });

  return tasks;
};

const deleteTask = async (id) => {
  const task = await Task.findByPk(id, { paranoid: false });

  if (!task || task.deleted_at) {
    throw new AppError("Task not found", 404, "NOT_FOUND");
  }

  await task.update({ is_active: false });
  await task.destroy();
  await task.reload({ paranoid: false });

  return {
    id: task.id,
    is_active: false,
    deleted_at: task.deleted_at,
  };
};

const updateTask = async (id, data) => {
  const transaction = await sequelize.transaction();

  try {
    const task = await Task.findByPk(id, {
      include: [{ model: TaskMedia }, { model: TaskQuestion }],
      paranoid: false,
      transaction,
    });

    if (!task || task.deleted_at) {
      throw new AppError("Task not found", 404, "NOT_FOUND");
    }

    const {
      title,
      description,
      type,
      is_active,
      image_url,
      questions,
    } = data;

    const previousType = task.type;
    const nextType = type || task.type;
    const updates = {};

    if (title !== undefined) {
      updates.title = title;
    }

    if (description !== undefined) {
      updates.description = description;
    }

    if (type !== undefined) {
      updates.type = type;
    }

    if (is_active !== undefined) {
      updates.is_active = is_active;
    }

    if (Object.keys(updates).length > 0) {
      await task.update(updates, { transaction });
    }

    if (nextType === "image") {
      if (questions !== undefined) {
        throw new AppError(
          "questions are not allowed for image task",
          400,
          "VALIDATION_ERROR",
        );
      }

      if (previousType !== "image" && !image_url) {
        throw new AppError(
          "Image file is required when changing task type to image.",
          400,
          "VALIDATION_ERROR",
        );
      }

      await TaskQuestion.destroy({
        where: { task_id: task.id },
        transaction,
      });

      if (image_url) {
        await TaskMedia.destroy({
          where: { task_id: task.id },
          transaction,
        });

        await TaskMedia.create(
          {
            task_id: task.id,
            image_url,
          },
          { transaction },
        );
      } else {
        const existingMediaCount = await TaskMedia.count({
          where: { task_id: task.id },
          transaction,
        });

        if (!existingMediaCount) {
          throw new AppError(
            "Image file is required for image task.",
            400,
            "VALIDATION_ERROR",
          );
        }
      }
    }

    if (nextType === "question") {
      if (image_url) {
        throw new AppError(
          "Image file is not allowed for question type task",
          400,
          "VALIDATION_ERROR",
        );
      }

      const mustProvideQuestions = previousType !== "question";

      if (mustProvideQuestions && !questions) {
        throw new AppError(
          "questions are required when changing task type to question",
          400,
          "VALIDATION_ERROR",
        );
      }

      await TaskMedia.destroy({
        where: { task_id: task.id },
        transaction,
      });

      if (questions) {
        const parsedQuestions =
          typeof questions === "string" ? JSON.parse(questions) : questions;

        const existingQuestion = await TaskQuestion.findOne({
          where: { task_id: task.id },
          transaction,
        });

        if (existingQuestion) {
          await existingQuestion.update(
            {
              questions: parsedQuestions,
            },
            { transaction },
          );
        } else {
          await TaskQuestion.create(
            {
              task_id: task.id,
              questions: parsedQuestions,
            },
            { transaction },
          );
        }
      } else {
        const existingQuestionCount = await TaskQuestion.count({
          where: { task_id: task.id },
          transaction,
        });

        if (!existingQuestionCount) {
          throw new AppError(
            "questions are required for question task",
            400,
            "VALIDATION_ERROR",
          );
        }
      }
    }

    const updatedTask = await Task.findByPk(task.id, {
      include: [{ model: TaskMedia }, { model: TaskQuestion }],
      transaction,
    });

    await transaction.commit();

    return updatedTask;
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    throw error;
  }
};

module.exports = { createTask, updateTask, getAllTasks, deleteTask };
