'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('Invoices');

    // Solo agregar columnas si no existen
    const columnsToAdd = [];

    if (!tableInfo.cufe) {
      columnsToAdd.push(
        queryInterface.addColumn('Invoices', 'cufe', {
          type: Sequelize.STRING,
          allowNull: true,
        })
      );
    }

    if (!tableInfo.qrCode) {
      columnsToAdd.push(
        queryInterface.addColumn('Invoices', 'qrCode', {
          type: Sequelize.TEXT,
          allowNull: true,
        })
      );
    }

    if (!tableInfo.orderReference) {
      columnsToAdd.push(
        queryInterface.addColumn('Invoices', 'orderReference', {
          type: Sequelize.STRING,
          allowNull: true,
        })
      );
    }

    // Ejecutar todas las promesas de manera segura
    return Promise.all(columnsToAdd);
  },

  async down(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.removeColumn('Invoices', 'cufe'),
      queryInterface.removeColumn('Invoices', 'qrCode'),
      queryInterface.removeColumn('Invoices', 'orderReference'),
    ]);
  },
};
