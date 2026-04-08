'use strict';

module.exports = (sequelize, DataTypes) => {
  const TaskQuestion = sequelize.define('TaskQuestion', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    task_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    questions: {
      type: DataTypes.JSON,
      allowNull: false
    }
  }, {
    tableName: 'Task_Questions',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    timestamps: true,
    underscored: true
  });

  TaskQuestion.associate = (models) => {
    TaskQuestion.belongsTo(models.Task, { foreignKey: 'task_id' });
  };

  return TaskQuestion;
};
