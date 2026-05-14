const asyncHandler = require("../utils/async-handler");
const { sendSuccess } = require("../utils/api-response");
const AppError = require("../utils/app-error");
const ArchetypeService = require("../services/archetype.service");
const {
  generateReportPdf,
  uploadReportPdfToS3,
} = require("../services/pdf.service");
const { computeStreak } = require("../services/auth.service");
const { AiReport } = require("../models");
const { setHomeBaseCourse } = require("../services/course.service");

/**
 * POST /api/v1/archetype/analyze
 * Runs Claude analysis → generates PDF → stores S3 key in DB → returns report_id
 */
const analyzeTranscript = asyncHandler(async (req, res) => {
  const { transcript } = req.body;
  const userId = req.user.id;

  if (!transcript || !transcript.trim()) {
    throw new AppError("transcript is required", 400, "VALIDATION_ERROR");
  }

  const result = await ArchetypeService.analyzeArchetype({
    transcript: transcript.trim(),
  });

  const [pdfBuffer, streak] = await Promise.all([
    generateReportPdf(result),
    computeStreak(req.user),
  ]);

  let pdfS3Key = null;
  let errorMessage = null;

  try {
    pdfS3Key = await uploadReportPdfToS3(pdfBuffer);
  } catch (uploadErr) {
    errorMessage = uploadErr.message || "PDF upload failed";
  }

  const report = await AiReport.create({
    user_id: userId,
    pdf_s3_key: pdfS3Key,
    error_message: errorMessage,
  });

  // Assign home base course on first archetype result (fire-and-forget, non-blocking)
  setHomeBaseCourse(userId, result.archetype.name).catch(() => {});

  return sendSuccess(res, {
    statusCode: 200,
    message: "Archetype analysis completed successfully",
    data: { ...result, streak, report_id: report.id },
  });
});

module.exports = { analyzeTranscript };
