const OnboardingService = require("../services/onboarding.service");
const asyncHandler = require("../utils/async-handler");
const { sendSuccess } = require("../utils/api-response");

const createQuestion = asyncHandler(async (req, res) => {
  const question = await OnboardingService.createQuestion(req.body);

  return sendSuccess(res, {
    statusCode: 201,
    message: "Onboarding question created successfully",
    data: { question },
  });
});

const getAllQuestions = asyncHandler(async (req, res) => {
  const questions = await OnboardingService.getAllQuestions();

  return sendSuccess(res, {
    message: "Onboarding questions retrieved successfully",
    data: { questions },
  });
});

const getQuestionById = asyncHandler(async (req, res) => {
  const question = await OnboardingService.getQuestionById(req.params.id);

  return sendSuccess(res, {
    message: "Onboarding question retrieved successfully",
    data: { question },
  });
});

const updateQuestion = asyncHandler(async (req, res) => {
  const question = await OnboardingService.updateQuestion(
    req.params.id,
    req.body,
  );

  return sendSuccess(res, {
    message: "Onboarding question updated successfully",
    data: { question },
  });
});

const deleteQuestion = asyncHandler(async (req, res) => {
  const result = await OnboardingService.deleteQuestion(req.params.id);

  return sendSuccess(res, {
    message: "Onboarding question deleted successfully",
    data: result,
  });
});

module.exports = {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
};
