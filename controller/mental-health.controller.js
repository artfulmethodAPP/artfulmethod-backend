const asyncHandler = require("../utils/async-handler");
const { sendSuccess } = require("../utils/api-response");
const AppError = require("../utils/app-error");
const MentalHealthService = require("../services/mental-health.service");

const analyzeText = asyncHandler(async (req, res) => {
  const { text } = req.body;

  if (!text || !text.trim()) {
    throw new AppError("text is required", 400, "VALIDATION_ERROR");
  }

  const result = await MentalHealthService.analyzeMentalHealth({
    text: text.trim(),
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: "Analysis completed successfully",
    data: result,
  });
});

module.exports = { analyzeText };
