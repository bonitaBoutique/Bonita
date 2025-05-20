'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Cambia el tipo de columna a DATEONLY
    await queryInterface.changeColumn('Receipts', 'date', {
      type: Sequelize.DATEONLY,
      allowNull: true, // o false según tu modelo
      defaultValue: null // o Sequelize.NOW si prefieres
    });

    // 2. (Opcional) Corrige los datos existentes para que solo tengan la fecha local de Colombia
    // Si tus datos antiguos tienen la hora en UTC y quieres ajustarlos a Colombia:
    await queryInterface.sequelize.query(`
      UPDATE "Receipts"
      SET "date" = (("date" AT TIME ZONE 'UTC' AT TIME ZONE 'America/Bogota')::date)
      WHERE "date" IS NOT NULL
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Revertir a DATE con hora si lo necesitas
    await queryInterface.changeColumn('Receipts', 'date', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: Sequelize.NOW
    });
  }
};