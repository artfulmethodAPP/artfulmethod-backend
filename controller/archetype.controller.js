const asyncHandler = require("../utils/async-handler");
const { sendSuccess } = require("../utils/api-response");
const AppError = require("../utils/app-error");
const ArchetypeService = require("../services/archetype.service");
const {
  generateReportPdf,
  uploadReportPdfToS3,
} = require("../services/pdf.service");
const { computeStreak } = require("../services/auth.service");
const { AiReport, User } = require("../models");
const { setHomeBaseCourse } = require("../services/course.service");
const { sendArchetypeReportEmail } = require("../services/email.service");

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

  // Input Safeguard (Artful Method Section 5): if the transcript is missing,
  // too short, or out of scope, no report is generated. Return HTTP 200 with the
  // exact notice text so the client can surface it verbatim and offer a retry.
  if (result.rejected) {
    return sendSuccess(res, {
      statusCode: 200,
      message: result.notice.notice_title,
      data: {
        rejected: true,
        reason: result.notice.code,
        notice_title: result.notice.notice_title,
        notice_message: result.notice.notice_message,
      },
    });
  }

  const [pdfBuffer, streak] = await Promise.all([
    generateReportPdf({ ...result, participant: { name: req.user.name } }),
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
    report_json: result,
    error_message: errorMessage,
  });

  // Assign home base course on first archetype result (fire-and-forget, non-blocking)
  setHomeBaseCourse(userId, result.archetype.name).catch(() => {});

  // Email the report PDF (fire-and-forget, non-blocking, respects email_reports_enabled)
  if (pdfBuffer) {
    User.findByPk(userId, { attributes: ["email"] })
      .then((u) => {
        if (u?.email) {
          return sendArchetypeReportEmail({
            userId,
            email: u.email,
            archetypeName: result.archetype.name,
            pdfBuffer,
          });
        }
      })
      .catch(() => {});
  }

  return sendSuccess(res, {
    statusCode: 200,
    message: "Archetype analysis completed successfully",
    data: { rejected: false, ...result, streak, report_id: report.id },
  });
});

module.exports = { analyzeTranscript };
