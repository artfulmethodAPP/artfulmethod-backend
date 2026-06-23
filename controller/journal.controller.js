"use strict";

const asyncHandler = require("../utils/async-handler");
const { sendSuccess } = require("../utils/api-response");
const AppError = require("../utils/app-error");
const {
  getJournalEntries,
  getJournalEntryById,
  updateEntryPromptResponses,
  deleteEntry,
} = require("../services/journal.service");

/**
 * GET /api/v1/journal/entries
 */
const listEntries = asyncHandler(async (req, res) => {
  const entries = await getJournalEntries(req.user.id);
  return sendSuccess(res, {
    message: "Journal entries retrieved successfully",
    data: entries,
  });
});

/**
 * GET /api/v1/journal/entries/:id
 */
const getEntry = asyncHandler(async (req, res) => {
  const entry = await getJournalEntryById(req.user.id, req.params.id);
  if (!entry) throw new AppError("Journal entry not found", 404, "NOT_FOUND");
  return sendSuccess(res, {
    message: "Journal entry retrieved successfully",
    data: entry,
  });
});

/**
 * PATCH /api/v1/journal/entries/:id
 */
const updateEntry = asyncHandler(async (req, res) => {
  const prompt_responses = await updateEntryPromptResponses(
    req.user.id,
    req.params.id,
    req.body.prompt_responses,
  );
  return sendSuccess(res, {
    message: "Journal entry updated successfully",
    data: { prompt_responses },
  });
});

/**
 * DELETE /api/v1/journal/entries/:id
 */
const removeEntry = asyncHandler(async (req, res) => {
  const deleted = await deleteEntry(req.user.id, req.params.id);
  return sendSuccess(res, {
    message: "Journal entry deleted successfully",
    data: deleted,
  });
});

module.exports = { listEntries, getEntry, updateEntry, removeEntry };
