"use strict";

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM("admin", "user"),
        defaultValue: "user",
      },
      gender: {
        type: DataTypes.ENUM("male", "female", "others"),
        allowNull: true,
      },
      otp_code: {
        type: DataTypes.STRING(6),
        allowNull: true,
      },
      otp_expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      deleted_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "Users",
      paranoid: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      timestamps: true,
      underscored: true,
    },
  );

  User.associate = (models) => {
    User.hasMany(models.RefreshToken, { foreignKey: "user_id" });
    User.hasMany(models.Task, { foreignKey: "user_id" });
    User.hasMany(models.TaskAttempt, { foreignKey: "user_id" });
    User.hasMany(models.AudioTranscript, { foreignKey: "user_id" });
    User.hasMany(models.EmailLog, { foreignKey: "user_id" });
    User.belongsTo(models.User, { as: "DeletedBy", foreignKey: "deleted_by" });
  };

  return User;
};
