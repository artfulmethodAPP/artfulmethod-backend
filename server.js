const express = require("express");
const path = require("path");
const setupSwagger = require("./swagger");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());
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

app.use((error, req, res, next) => {
  if (!error) {
    return next();
  }

  return res.status(400).json({
    success: false,
    message: error.message || "Request failed",
  });
});

// ================================ server testing ===============================
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
