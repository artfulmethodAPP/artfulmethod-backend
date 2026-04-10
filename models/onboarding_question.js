"use strict";

module.exports = (sequelize, DataTypes) => {
  const OnboardingQuestion = sequelize.define(
    "OnboardingQuestion",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      question_text: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      options: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      tableName: "Onboarding_questions",
      createdAt: "created_at",
      updatedAt: "updated_at",
      timestamps: true,
      underscored: true,
    },
  );

  return OnboardingQuestion;
};
