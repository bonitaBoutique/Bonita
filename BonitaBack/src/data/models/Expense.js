const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define("Expense", {
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM,
      values: [
        "Impuestos",
        "Nomina Colaboradores",
        "Nomina Contratistas Externos",
        "Publicidad",
        "Servicio Agua",
        "Servicio Energia",
        "Servicio Internet",
        "Suministros",
        "Seguridad Social",
        "Viaticos y Transportes",
        "Inventario",
      ],
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paymentMethods: {
      type: DataTypes.ENUM,
      values: ["Efectivo", "Tarjeta", "Nequi", "Bancolombia", "Otro"],
      allowNull: false,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  });
};
