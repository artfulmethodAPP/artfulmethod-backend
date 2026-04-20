const express = require("express");
const userRoutes = require("./user.routes");
const taskRoutes = require("./task.routes");
const transcribeRoutes = require("./transcribe.routes");
const mentalHealthRoutes = require("./mental-health.routes");
const router = express.Router();

router.use("/auth", userRoutes);
router.use("/tasks", taskRoutes);
router.use("/transcribe", transcribeRoutes);
router.use("/mental-health", mentalHealthRoutes);

module.exports = router;
