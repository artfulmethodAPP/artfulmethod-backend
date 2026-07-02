"use strict";

const AdminService = require("../services/admin.service");
const asyncHandler = require("../utils/async-handler");
const { sendSuccess } = require("../utils/api-response");
const AppError = require("../utils/app-error");
const { getPresignedUrl } = require("../services/s3.service");

const getUsers = asyncHandler(async (req, res) => {
  const { page, limit, search, status } = req.query;
  const result = await AdminService.getUsers({ page, limit, search, status });
  return sendSuccess(res, {
    message: "Users retrieved successfully",
    data: result,
  });
});

const getUserDetail = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const result = await AdminService.getUserDetail(userId);
  return sendSuccess(res, {
    message: "User detail retrieved successfully",
    data: result,
  });
});

const getUserLessonReports = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const result = await AdminService.getUserLessonReports(userId);
  return sendSuccess(res, {
    message: "User session reports retrieved successfully",
    data: result,
  });
});

const getUserTranscripts = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const result = await AdminService.getUserTranscripts(userId);
  return sendSuccess(res, {
    message: "User transcripts retrieved successfully",
    data: result,
  });
});

const getUserAudios = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const result = await AdminService.getUserAudios(userId);
  return sendSuccess(res, {
    message: "User audios retrieved successfully",
    data: result,
  });
});

const hardDeleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const result = await AdminService.hardDeleteUser(userId);
  return sendSuccess(res, {
    message: "User permanently deleted",
    data: result,
  });
});

// ─── Image upload (course/report artwork — returns S3 key) ────────────────────

const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("No image file provided", 400, "VALIDATION_ERROR");
  }
  return sendSuccess(res, {
    message: "Image uploaded successfully",
    data: { s3_key: req.file.key },
  });
});

const getPresignedImageUrl = asyncHandler(async (req, res) => {
  const { s3_key } = req.body;
  if (!s3_key || !s3_key.trim()) {
    throw new AppError("s3_key is required", 400, "VALIDATION_ERROR");
  }
  const url = await getPresignedUrl(s3_key.trim());
  return sendSuccess(res, {
    message: "Presigned URL generated successfully",
    data: { url },
  });
});

// ─── Media uploads (meditations — return S3 key) ──────────────────────────────

const uploadMediaImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("No image file provided", 400, "VALIDATION_ERROR");
  }
  return sendSuccess(res, {
    message: "Image uploaded successfully",
    data: { s3_key: req.file.key },
  });
});

const uploadMediaAudio = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("No audio file provided", 400, "VALIDATION_ERROR");
  }
  return sendSuccess(res, {
    message: "Audio uploaded successfully",
    data: { s3_key: req.file.key },
  });
});

// Returns a presigned URL (valid 1 hour) for any S3 key.
const getMediaPresignedUrl = asyncHandler(async (req, res) => {
  const key = req.body?.s3_key;
  if (!key || !key.trim()) {
    throw new AppError("s3_key is required", 400, "VALIDATION_ERROR");
  }
  const url = await getPresignedUrl(key.trim());
  return sendSuccess(res, {
    message: "Presigned URL generated successfully",
    data: { url },
  });
});

module.exports = {
  getUsers,
  getUserDetail,
  getUserLessonReports,
  getUserTranscripts,
  getUserAudios,
  hardDeleteUser,
  uploadImage,
  getPresignedImageUrl,
  uploadMediaImage,
  uploadMediaAudio,
  getMediaPresignedUrl,
};
