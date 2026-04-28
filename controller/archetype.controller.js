const asyncHandler = require("../utils/async-handler");
const { sendSuccess } = require("../utils/api-response");
const AppError = require("../utils/app-error");
const ArchetypeService = require("../services/archetype.service");
const { computeStreak } = require("../services/auth.service");

/**
 * POST /api/v1/archetype/analyze
 * Accepts the (user-reviewed) transcript text → runs Claude archetype analysis
 */
const analyzeTranscript = asyncHandler(async (req, res) => {
  const { transcript } = req.body;

  if (!transcript || !transcript.trim()) {
    throw new AppError("transcript is required", 400, "VALIDATION_ERROR");
  }

  const result = await ArchetypeService.analyzeArchetype({ transcript: transcript.trim() });

  const streak = await computeStreak(req.user);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Archetype analysis completed successfully",
    data: { ...result, streak },
  });
});

module.exports = { analyzeTranscript };
