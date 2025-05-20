const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define(
    "Reservation",
    {
      id_reservation: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      id_orderDetail: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      n_document: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      partialPayment: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      totalPaid: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      dueDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("Pendiente", "Completada", "Cancelada"),
        allowNull: false,
        defaultValue: "Pendiente",
      },
    },
    {
      paranoid: true,
      
    }
  );
};