"use strict";

const AdminService = require("../services/admin.service");
const asyncHandler = require("../utils/async-handler");
const { sendSuccess } = require("../utils/api-response");

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
    message: "User lesson reports retrieved successfully",
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

module.exports = {
  getUsers,
  getUserDetail,
  getUserLessonReports,
  getUserTranscripts,
};
