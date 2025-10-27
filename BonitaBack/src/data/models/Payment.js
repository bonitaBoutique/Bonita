const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define(
    "Payment",
    {
      id_payment: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      payment_state: {
        type: DataTypes.ENUM("Pago", "Pendiente"),
        allowNull: false,
      },

      amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      payMethod: {
        type: DataTypes.ENUM(
          "Efectivo",
          "Tarjeta de Crédito",
          "Tarjeta de Débito",
          "Transferencia",
          "Nequi",
          "Daviplata",
          "Sistecredito",
          "Addi",
          "Bancolombia",
          "GiftCard",
          "Crédito",
          "Otro"
        ),
        allowNull: true,
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      paranoid: true,
    }
  );
};
