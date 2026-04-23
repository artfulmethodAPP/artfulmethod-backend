"use strict";

module.exports = (sequelize, DataTypes) => {
  const UserToken = sequelize.define(
    "UserToken",
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
      token_type: {
        type: DataTypes.ENUM(
          "refresh",
          "forgot_password",
          "verify_email",
          "reset_password",
        ),
        allowNull: false,
      },
      token: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      tableName: "User_Tokens",
      createdAt: "created_at",
      updatedAt: "updated_at",
      timestamps: true,
      underscored: true,
    },
  );

  UserToken.associate = (models) => {
    UserToken.belongsTo(models.User, { foreignKey: "user_id" });
  };

  return UserToken;
};
