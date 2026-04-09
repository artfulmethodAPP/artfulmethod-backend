"use strict";

module.exports = (sequelize, DataTypes) => {
  const AudioTranscript = sequelize.define(
    "AudioTranscript",
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
      transcript_text: {
        type: DataTypes.TEXT("long"),
        allowNull: false,
      },
      duration_seconds: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      language: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      word_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      character_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "Audio_Transcripts",
      createdAt: "created_at",
      updatedAt: "updated_at",
      timestamps: true,
      underscored: true,
    },
  );

  AudioTranscript.associate = (models) => {
    AudioTranscript.belongsTo(models.User, { foreignKey: "user_id" });
  };

  return AudioTranscript;
};
