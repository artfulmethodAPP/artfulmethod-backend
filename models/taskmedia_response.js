'use strict';

module.exports = (sequelize, DataTypes) => {
  const TaskMediaResponse = sequelize.define('TaskMediaResponse', {
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
    voice_url: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    transcript_text: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    duration_sec: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'Task_Media_Responses',
    timestamps: true
  });

  TaskMediaResponse.associate = (models) => {
    TaskMediaResponse.belongsTo(models.TaskAttempt, { foreignKey: 'attempt_id' });
  };

  return TaskMediaResponse;
};
