const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define(
    "Receipt",
    {
      id_receipt: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      cashier_document: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "Users",
          key: "n_document",
        },
      },
      buyer_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      buyer_email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      buyer_phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      total_amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      payMethod: {
        type: DataTypes.ENUM(
          "Efectivo",
          "Sistecredito",
          "Addi",
          "Tarjeta",
          "Crédito",
          "Bancolombia",
          "Otro"
        ),
        allowNull: false,
      },
      amount: {
        type: DataTypes.FLOAT,
        allowNull: false, 
      },
      amount2: {
        type: DataTypes.FLOAT,
        allowNull: true, 
      },
      payMethod2: {
        type: DataTypes.ENUM(
          "Efectivo",
          "Sistecredito",
          "Addi",
          "Tarjeta",
          "Crédito",
          "Bancolombia",
          "Otro"
        ),
        allowNull: true, // <-- Opcional
      },
      date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      timestamps: true,
    }
  );
};
