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

/**
 * POST /api/v1/archetype/analyze
 * Accepts the (user-reviewed) transcript text → runs Claude archetype analysis
 * → generates a PDF report → uploads to S3 → saves AiReport record
 */
const analyzeTranscript = asyncHandler(async (req, res) => {
  const { transcript } = req.body;
  const userId = req.user.id;

  if (!transcript || !transcript.trim()) {
    throw new AppError("transcript is required", 400, "VALIDATION_ERROR");
  }

  if (!userId) {
    throw new AppError("id is required", 400, "VALIDATION_ERROR");
  }

  // ── Run Claude analysis
  const result = await ArchetypeService.analyzeArchetype({
    transcript: transcript.trim(),
  });

  // ── Generate PDF and upload to S3 (in parallel with streak computation)
  const [pdfBuffer, streak] = await Promise.all([
    generateReportPdf(result),
    computeStreak(req.user),
  ]);

  let pdfUrl = null;
  let errorMessage = null;

  try {
    pdfUrl = await uploadReportPdfToS3(pdfBuffer);
  } catch (uploadErr) {
    // Log the error but do not fail the whole request — the analysis data is still valid
    errorMessage = uploadErr.message || "PDF upload failed";
  }

  // ── Persist the AiReport record
  await AiReport.create({
    user_id: userId,
    pdf_url: pdfUrl,
    error_message: errorMessage,
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: "Archetype analysis completed successfully",
    data: { ...result, streak, pdf_url: pdfUrl },
  });
});

module.exports = { analyzeTranscript };
