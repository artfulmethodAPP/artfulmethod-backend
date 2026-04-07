'use strict';

module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
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
    title: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    type: {
      type: DataTypes.ENUM('image', 'question'),
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'Tasks',
    paranoid: true,
<<<<<<< HEAD
    deletedAt: 'deletedAt',
=======
>>>>>>> 5c1ee93a6d068a3bff3b4184ef7f2d47e8e8cbda
    timestamps: true
  });

  Task.associate = (models) => {
    Task.belongsTo(models.User, { foreignKey: 'user_id' });
    Task.hasMany(models.TaskMedia, { foreignKey: 'task_id' });
    Task.hasMany(models.TaskQuestion, { foreignKey: 'task_id' });
    Task.hasMany(models.TaskAttempt, { foreignKey: 'task_id' });
  };

  return Task;
};
