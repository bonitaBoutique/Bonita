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
          "Nequi",
          "Tarjeta",
          "Crédito",
          "Bancolombia",
          "Otro",
          "GiftCard"
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
          "Nequi",
          "Tarjeta",
          "Crédito",
          "Bancolombia",
          "Otro",
          "GiftCard"
        ),
        allowNull: true, // <-- Opcional
      },
      date: {
        type: DataTypes.DATEONLY, // Solo fecha, sin hora
        allowNull: false,
        defaultValue: DataTypes.NOW // Esto tomará la fecha de Colombia
      },
      estimated_delivery_date: {
        type: DataTypes.DATE, // Fecha y hora
        allowNull: true,
      },
    },
    {
      paranoid: true,
      timestamps: true, // Cambiar a true para createdAt/updatedAt
    }
  );
};
