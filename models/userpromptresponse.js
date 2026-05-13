"use strict";

module.exports = (sequelize, DataTypes) => {
  const UserPromptResponse = sequelize.define(
    "UserPromptResponse",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      user_lesson_attempt_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      prompt_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      audio_s3_key: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      transcript_text: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      duration_seconds: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      submitted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "User_Prompt_Responses",
      createdAt: "created_at",
      updatedAt: "updated_at",
      timestamps: true,
      underscored: true,
    },
  );

  UserPromptResponse.associate = (models) => {
    UserPromptResponse.belongsTo(models.UserLessonAttempt, { foreignKey: "user_lesson_attempt_id" });
  };

  return UserPromptResponse;
};
