'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // ✅ Cambiar el tipo de columna description en la tabla Expenses
    await queryInterface.changeColumn('Expenses', 'description', {
      type: Sequelize.TEXT('long'), // O Sequelize.TEXT('medium') si prefieres
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // ✅ Rollback: volver al tipo TEXT normal
    await queryInterface.changeColumn('Expenses', 'description', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  }
};