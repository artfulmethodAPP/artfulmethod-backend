const asyncHandler = require("../utils/async-handler");
const { sendSuccess } = require("../utils/api-response");
const AppError = require("../utils/app-error");
const { Archetype, AiReport } = require("../models");
const { getPresignedUrl } = require("../services/s3.service");

/**
 * POST /api/v1/archetypes
 * Admin only — create a new archetype, optionally with an icon uploaded to S3.
 */
const createArchetype = asyncHandler(async (req, res) => {
  const { name, description, color } = req.body;

  const icon_url = req.file ? req.file.location : null;

  const archetype = await Archetype.create({
    created_by: req.user.id,
    name,
    description: description || null,
    color: color || null,
    icon_url,
  });

  return sendSuccess(res, {
    statusCode: 201,
    message: "Archetype created successfully",
    data: { archetype },
  });
});

/**
 * GET /api/v1/archetypes
 * Authenticated — list all archetypes.
 */
const getAllArchetypes = asyncHandler(async (req, res) => {
  const archetypes = await Archetype.findAll({ order: [["created_at", "ASC"]] });

  return sendSuccess(res, {
    message: "Archetypes retrieved successfully",
    data: { archetypes },
  });
});

/**
 * GET /api/v1/archetypes/:id
 * Authenticated — get a single archetype by id.
 */
const getArchetype = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const archetype = await Archetype.findByPk(id);
  if (!archetype) {
    throw new AppError("Archetype not found", 404, "NOT_FOUND");
  }

  return sendSuccess(res, {
    message: "Archetype retrieved successfully",
    data: { archetype },
  });
});

/**
 * PUT /PATCH /api/v1/archetypes/:id
 * Admin only — update an archetype; replaces icon in S3 if a new file is uploaded.
 */
const updateArchetype = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, color } = req.body;

  const archetype = await Archetype.findByPk(id);
  if (!archetype) {
    throw new AppError("Archetype not found", 404, "NOT_FOUND");
  }

  const updates = {};
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (color !== undefined) updates.color = color;
  if (req.file) updates.icon_url = req.file.location;

  if (Object.keys(updates).length === 0) {
    throw new AppError("At least one field is required to update", 400, "VALIDATION_ERROR");
  }

  await archetype.update(updates);

  return sendSuccess(res, {
    message: "Archetype updated successfully",
    data: { archetype },
  });
});

/**
 * DELETE /api/v1/archetypes/:id
 * Admin only — delete an archetype.
 */
const deleteArchetype = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const archetype = await Archetype.findByPk(id);
  if (!archetype) {
    throw new AppError("Archetype not found", 404, "NOT_FOUND");
  }

  await archetype.destroy();

  return sendSuccess(res, {
    message: "Archetype deleted successfully",
    data: { archetype },
  });
});

/**
 * GET /api/v1/archetype/report/:id
 * Generates a fresh 1-hour presigned URL for the authenticated user's PDF report
 */
const getReportUrl = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const report = await AiReport.findOne({
    where: { id, user_id: userId },
  });

  if (!report) {
    throw new AppError("Report not found", 404, "NOT_FOUND");
  }

  if (!report.pdf_s3_key) {
    throw new AppError("PDF not available for this report", 404, "NOT_FOUND");
  }

  const pdf_url = await getPresignedUrl(report.pdf_s3_key);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Report URL generated successfully",
    data: { pdf_url },
  });
});

module.exports = {
  createArchetype,
  getAllArchetypes,
  getArchetype,
  updateArchetype,
  deleteArchetype,
  getReportUrl,
};
