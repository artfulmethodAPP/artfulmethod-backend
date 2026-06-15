const asyncHandler = require("../utils/async-handler");
const { sendSuccess } = require("../utils/api-response");
const ReportsService = require("../services/reports.service");

const getAllReports = asyncHandler(async (req, res) => {
  const reports = await ReportsService.getAllUserReports(req.user.id);

  return sendSuccess(res, {
    message: "Reports retrieved successfully",
    data: { reports },
  });
});

/**
 * GET /api/v1/reports/:id?type=archetype|session_report|growth_in_range
 * Returns the full detail payload for a single report. `type` (from the list
 * item) is required because report_id is only unique within a report type.
 */
const getReportById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { type } = req.query;

  const report = await ReportsService.getReportById(req.user.id, id, type);

  return sendSuccess(res, {
    message: "Report retrieved successfully",
    data: report,
  });
});

module.exports = { getAllReports, getReportById };
