const { OnboardingQuestion } = require("../models");
const AppError = require("../utils/app-error");

const createQuestion = async ({ key, question_text, options }) => {
  const existing = await OnboardingQuestion.findOne({ where: { key } });

  if (existing) {
    throw new AppError(
      `A question with key '${key}' already exists`,
      409,
      "CONFLICT",
    );
  }

  const question = await OnboardingQuestion.create({
    key,
    question_text,
    options: options || null,
  });

  return question;
};

const getAllQuestions = async () => {
  const questions = await OnboardingQuestion.findAll({
    order: [["created_at", "ASC"]],
  });
  return questions;
};

const getQuestionById = async (id) => {
  const question = await OnboardingQuestion.findByPk(id);

  if (!question) {
    throw new AppError("Question not found", 404, "NOT_FOUND");
  }

  return question;
};

const updateQuestion = async (id, data) => {
  const question = await OnboardingQuestion.findByPk(id);

  if (!question) {
    throw new AppError("Question not found", 404, "NOT_FOUND");
  }

  if (data.key && data.key !== question.key) {
    const keyConflict = await OnboardingQuestion.findOne({
      where: { key: data.key },
    });
    if (keyConflict) {
      throw new AppError(
        `A question with key '${data.key}' already exists`,
        409,
        "CONFLICT",
      );
    }
  }

  await question.update(data);

  return question;
};

const deleteQuestion = async (id) => {
  const question = await OnboardingQuestion.findByPk(id);

  if (!question) {
    throw new AppError("Question not found", 404, "NOT_FOUND");
  }

  await question.destroy();

  return { id };
};

module.exports = {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
};
