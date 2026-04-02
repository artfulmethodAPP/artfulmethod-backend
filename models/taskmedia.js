'use strict';

module.exports = (sequelize, DataTypes) => {
  const TaskMedia = sequelize.define('TaskMedia', {
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
    image_url: {
      type: DataTypes.STRING(250),
      allowNull: false
    }
  }, {
    tableName: 'Task_Media',
    timestamps: true
  });

  TaskMedia.associate = (models) => {
    TaskMedia.belongsTo(models.Task, { foreignKey: 'task_id' });
  };

  return TaskMedia;
};
