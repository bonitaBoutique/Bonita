// Migración: Agregar campo paymentMethod a la tabla CreditPayments
// Fecha: 2026-01-06
// Descripción: Agrega el campo paymentMethod para registrar el método de pago usado en pagos parciales de reservas

const { Sequelize } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    try {
      console.log('🔄 Iniciando migración: Agregar paymentMethod a CreditPayments...');
      
      // Verificar si la columna ya existe
      const tableDescription = await queryInterface.describeTable('CreditPayments');
      
      if (tableDescription.paymentMethod) {
        console.log('✅ La columna paymentMethod ya existe en CreditPayments');
        return;
      }

      // Agregar la columna paymentMethod
      await queryInterface.addColumn('CreditPayments', 'paymentMethod', {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'Efectivo',
        comment: 'Método de pago utilizado para el pago parcial'
      });

      console.log('✅ Columna paymentMethod agregada correctamente a CreditPayments');

      // Actualizar registros existentes para que tengan 'Efectivo' como valor por defecto
      await queryInterface.sequelize.query(`
        UPDATE "CreditPayments" 
        SET "paymentMethod" = 'Efectivo' 
        WHERE "paymentMethod" IS NULL;
      `);

      console.log('✅ Registros existentes actualizados con método de pago Efectivo');
      console.log('✅ Migración completada exitosamente');

    } catch (error) {
      console.error('❌ Error en migración:', error);
      throw error;
    }
  },

  down: async (queryInterface) => {
    try {
      console.log('🔄 Revirtiendo migración: Eliminar paymentMethod de CreditPayments...');
      
      // Eliminar la columna paymentMethod
      await queryInterface.removeColumn('CreditPayments', 'paymentMethod');
      
      console.log('✅ Migración revertida exitosamente');
    } catch (error) {
      console.error('❌ Error al revertir migración:', error);
      throw error;
    }
  }
};
