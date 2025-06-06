'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Receipts', 'observations', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Observaciones adicionales del recibo'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Receipts', 'observations');
  }
};
