const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define(
    "CreditPayment",
    {
      id_payment: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      id_reservation: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      timestamps: true,
    }
  );
};