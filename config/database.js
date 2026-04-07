const { sequelize } = require("../models");

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully!");
  } catch (error) {
    console.error("Database connection failed:");
    console.error(error.message);
  }
};

module.exports = connectDB;
