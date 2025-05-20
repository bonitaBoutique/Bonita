'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Cambia el tipo de columna a DATEONLY
    await queryInterface.changeColumn('Expenses', 'date', {
      type: Sequelize.DATEONLY,
      allowNull: false,
    });

    // Corrige los datos existentes para que solo tengan la fecha local de Colombia
    await queryInterface.sequelize.query(`
      UPDATE "Expenses"
      SET "date" = (("date" AT TIME ZONE 'UTC' AT TIME ZONE 'America/Bogota')::date)
      WHERE "date" IS NOT NULL
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Revertir a DATE con hora si lo necesitas
    await queryInterface.changeColumn('Expenses', 'date', {
      type: Sequelize.DATE,
      allowNull: false,
    });
  }
};