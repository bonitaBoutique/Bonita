'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Verificar si la columna ya existe antes de agregarla
    const tableDescription = await queryInterface.describeTable('Payments');
    if (!tableDescription.payMethod) {
      await queryInterface.addColumn('Payments', 'payMethod', {
        type: Sequelize.ENUM(
          'Efectivo',
          'Sistecredito',
          'Addi',
          'Tarjeta',
          'Crédito',
          'Bancolombia',
          'Otro'
        ),
        allowNull: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // Verificar si la columna existe antes de eliminarla
    const tableDescription = await queryInterface.describeTable('Payments');
    if (tableDescription.payMethod) {
      await queryInterface.removeColumn('Payments', 'payMethod');
    }
  },
};
