const express = require("express");
const authRoutes = require("./auth.routes");
const taskRoutes = require("./task.routes");
const transcribeRoutes = require("./transcribe.routes");
const mentalHealthRoutes = require("./mental-health.routes");
const router = express.Router();

router.use("/auth", authRoutes);
router.use("/tasks", taskRoutes);
router.use("/transcribe", transcribeRoutes);
router.use("/mental-health", mentalHealthRoutes);

module.exports = router;
