const express = require("express");
const authRoutes = require("./auth.routes");
const taskRoutes = require("./task.routes");
const transcribeRoutes = require("./transcribe.routes");
const archetypeRoutes = require("./archetype.routes");
const router = express.Router();

router.use("/auth", authRoutes);
router.use("/tasks", taskRoutes);
router.use("/transcribe", transcribeRoutes);
router.use("/archetype", archetypeRoutes);

module.exports = router;
