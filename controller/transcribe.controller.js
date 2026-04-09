const asyncHandler = require("../utils/async-handler");
const { sendSuccess } = require("../utils/api-response");
const TranscribeService = require("../services/transcribe.service");

const saveTranscript = asyncHandler(async (req, res) => {
  const transcript = await TranscribeService.saveTranscript({
    userId: req.user.id,
    ...req.body,
  });

  return sendSuccess(res, {
    statusCode: 201,
    message: "Transcript saved successfully",
    data: { transcript },
  });
});

module.exports = {
  saveTranscript,
};
