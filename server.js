require("dotenv").config();
const express = require("express");
const path = require("path");
const setupSwagger = require("./swagger");
const cors = require("cors");
const AppError = require("./utils/app-error");
const errorHandler = require("./middlewares/error-handler");

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "*",
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  }),
);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 3000;

// ================================ DB connection ==============================
const connectDB = require("./config/database");
connectDB();

// ================================ get request ================================
app.get("/", (req, res) => {
  res.send("Hello World!");
});

setupSwagger(app);

// ================================ routes =====================================
app.use("/api/v1", require("./routes/index.route"));

app.use((req, res, next) => {
  next(new AppError("Route not found", 404, "NOT_FOUND"));
});

app.use(errorHandler);

// ================================ server testing ===============================
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


