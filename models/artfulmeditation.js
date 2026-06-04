"use strict";

module.exports = (sequelize, DataTypes) => {
  const ArtfulMeditation = sequelize.define(
    "ArtfulMeditation",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      archetype: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      artwork_title: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      artist_name: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      years: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      medium: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      dimensions: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      location: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      about_art: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      image_s3_key: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      audio_s3_key: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      audio_duration: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      sort_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "Artful_Meditations",
      createdAt: "created_at",
      updatedAt: "updated_at",
      timestamps: true,
      underscored: true,
    },
  );

  return ArtfulMeditation;
};
