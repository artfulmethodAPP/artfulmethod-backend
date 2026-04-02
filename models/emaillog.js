"use strict";

module.exports = (sequelize, DataTypes) => {
  const EmailLog = sequelize.define(
    "EmailLog",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      report_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(250),
        allowNull: false,
      },
      email_type: {
        type: DataTypes.ENUM("forgot-password", "report", "welcome", "otp"),
        allowNull: false,
      },
      subject: {
        type: DataTypes.STRING(250),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("sent", "failed"),
        allowNull: false,
      },
      error_message: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      sent_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "Email_logs",
      timestamps: true,
      underscored: true,
    },
  );

  EmailLog.associate = (models) => {
    EmailLog.belongsTo(models.User, { foreignKey: "user_id" });
    EmailLog.belongsTo(models.AiReport, { foreignKey: "report_id" });
  };

  return EmailLog;
};
