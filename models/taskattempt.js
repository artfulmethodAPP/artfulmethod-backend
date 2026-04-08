'use strict';

module.exports = (sequelize, DataTypes) => {
  const TaskAttempt = sequelize.define('TaskAttempt', {
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
    task_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'Task_Attempts',
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    timestamps: true,
    underscored: true
  });

  TaskAttempt.associate = (models) => {
    TaskAttempt.belongsTo(models.User, { foreignKey: 'user_id' });
    TaskAttempt.belongsTo(models.Task, { foreignKey: 'task_id' });
    TaskAttempt.hasMany(models.TaskMediaResponse, { foreignKey: 'attempt_id' });
    TaskAttempt.hasMany(models.TaskQuestionsResponse, { foreignKey: 'attempt_id' });
    TaskAttempt.hasOne(models.AiReport, { foreignKey: 'attempt_id' });
  };

  return TaskAttempt;
};
