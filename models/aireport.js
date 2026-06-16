'use strict';

module.exports = (sequelize, DataTypes) => {
  const AiReport = sequelize.define('AiReport', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    pdf_s3_key: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    report_json: {
      // Full archetype analysis result from POST /archetype/analyze.
      type: DataTypes.JSON,
      allowNull: true
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'Ai_Reports',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
    timestamps: true,
    underscored: true
  });

  AiReport.associate = (models) => {
    AiReport.belongsTo(models.User, { foreignKey: 'user_id' });
    AiReport.hasMany(models.EmailLog, { foreignKey: 'report_id' });
  };

  return AiReport;
};
