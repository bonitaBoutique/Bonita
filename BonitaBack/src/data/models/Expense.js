const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('Expense', {
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM,
      values: [
        'Impuestos',
        'Nomina Colaboradores',
        'Nomina Contratistas Externos',
        'Publicidad',
        'Servicio Agua',
        'Servicio Energia',
        'Servicio Internet',
        'Suministros',
        'Viaticos y Transportes',
      ],
      allowNull: false,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  });
};

