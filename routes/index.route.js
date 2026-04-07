const express = require("express");
const userRoutes = require("./user.routes");
const taskRoutes = require("./task.routes");
const router = express.Router();

router.use("/auth", userRoutes)
router.use("/tasks", taskRoutes)

module.exports = router;
