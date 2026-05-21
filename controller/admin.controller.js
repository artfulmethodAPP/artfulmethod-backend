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

module.exports = { getUsers };
