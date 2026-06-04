"use strict";

const asyncHandler = require("../utils/async-handler");
const { sendSuccess } = require("../utils/api-response");
const MeditationService = require("../services/meditation.service");

const getMeditations = asyncHandler(async (req, res) => {
  const data = await MeditationService.getAllMeditations();
  return sendSuccess(res, {
    message: "Meditations retrieved successfully",
    data,
  });
});

const getMeditationById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = await MeditationService.getMeditationById(id);
  return sendSuccess(res, {
    message: "Meditation retrieved successfully",
    data,
  });
});

module.exports = { getMeditations, getMeditationById };
