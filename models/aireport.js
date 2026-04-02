'use strict';

module.exports = (sequelize, DataTypes) => {
  const AiReport = sequelize.define('AiReport', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    attempt_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    pdf_url: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    ai_response_url_link: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'Ai_Report',
    timestamps: true
  });

  AiReport.associate = (models) => {
    AiReport.belongsTo(models.TaskAttempt, { foreignKey: 'attempt_id' });
    AiReport.hasMany(models.EmailLog, { foreignKey: 'report_id' });
  };

  return AiReport;
};
