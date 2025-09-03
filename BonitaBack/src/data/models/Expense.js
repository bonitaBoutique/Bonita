const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define("Expense", {
    date: {
        type: DataTypes.DATEONLY, // Solo fecha, sin hora
        allowNull: false,
        defaultValue: DataTypes.NOW // Esto tomará la fecha de Colombia
      },
      estimated_delivery_date: {
        type: DataTypes.DATE, // Fecha y hora
        allowNull: true,
      },
    type: {
      type: DataTypes.ENUM,
      values: [
        "Impuestos",
        "Seguridad Social",
        "Nomina Colaboradores",
        "Nomina Contratistas Externos",
        "Publicidad",
        "Servicio Agua",
        "Servicio Energia",
        "Arriendo",
        "Servicio Internet",
        "Suministros",
        "Viaticos y Transportes",
        "Inventario",
        "Proveedores",
        "Otros",
      ],
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
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
    destinatario: { // <-- NUEVO CAMPO
      type: DataTypes.STRING,
      allowNull: true, // O false si siempre debe tener un valor
    },
  });
};
