'use strict';

module.exports = (sequelize, DataTypes) => {
  const TaskQuestionsResponse = sequelize.define('TaskQuestionsResponse', {
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
    answer_text: {
      type: DataTypes.JSON,
      allowNull: false
    }
  }, {
    tableName: 'Task_Question_Responses',
    timestamps: true
  });

  TaskQuestionsResponse.associate = (models) => {
    TaskQuestionsResponse.belongsTo(models.TaskAttempt, { foreignKey: 'attempt_id' });
  };

  return TaskQuestionsResponse;
};
