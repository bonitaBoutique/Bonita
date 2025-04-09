'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Agregar la columna 'payMethod' a la tabla 'Payments'
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
      allowNull: true, // Método de pago opcional
    });
  },

  async down(queryInterface, Sequelize) {
    // Eliminar la columna 'payMethod' de la tabla 'Payments'
    await queryInterface.removeColumn('Payments', 'payMethod');
  }
};
