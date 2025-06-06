const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define(
    "AddiSistecreditoDeposit",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      platform: {
        type: DataTypes.ENUM("Addi", "Sistecredito"),
        allowNull: false,
        // ✅ REMOVER EL COMMENT TEMPORALMENTE
      },
      depositDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      referenceNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      registeredBy: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "Users",
          key: "n_document",
        },
      },
      status: {
        type: DataTypes.ENUM("Registrado", "Conciliado", "Revisión"),
        allowNull: false,
        defaultValue: "Registrado",
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      }
    },
    {
      paranoid: true,
      timestamps: true,
      tableName: 'AddiSistecreditoDeposits'
    }
  );
};