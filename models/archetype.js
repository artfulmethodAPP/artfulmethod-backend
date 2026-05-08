"use strict";

module.exports = (sequelize, DataTypes) => {
  const Archetype = sequelize.define(
    "Archetype",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      color: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      icon_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "Archetypes",
      createdAt: "created_at",
      updatedAt: "updated_at",
      timestamps: true,
      underscored: true,
    },
  );

  Archetype.associate = (models) => {
    Archetype.belongsTo(models.User, {
      foreignKey: "created_by",
      as: "creator",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  };

  return Archetype;
};
