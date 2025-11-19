/**
 * Migración: Agregar campo paymentMethod a tabla Reservations
 * Fecha: 2025-11-19
 * Descripción: Agrega la columna paymentMethod para registrar el método de pago
 *              del pago inicial de cada reserva
 */

const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Iniciando migración: agregar paymentMethod a Reservations...');
    
    try {
      // Verificar si la columna ya existe
      const tableDescription = await queryInterface.describeTable('Reservations');
      
      if (tableDescription.paymentMethod) {
        console.log('✅ La columna paymentMethod ya existe en Reservations');
        return;
      }

      // Agregar columna paymentMethod
      await queryInterface.addColumn('Reservations', 'paymentMethod', {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Método de pago del pago inicial de la reserva'
      });

      console.log('✅ Columna paymentMethod agregada exitosamente a Reservations');

      // Actualizar registros existentes con valor por defecto
      await queryInterface.sequelize.query(`
        UPDATE "Reservations"
        SET "paymentMethod" = 'Efectivo'
        WHERE "paymentMethod" IS NULL;
      `);

      console.log('✅ Registros existentes actualizados con paymentMethod = "Efectivo"');

    } catch (error) {
      console.error('❌ Error en migración:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Revirtiendo migración: remover paymentMethod de Reservations...');
    
    try {
      await queryInterface.removeColumn('Reservations', 'paymentMethod');
      console.log('✅ Columna paymentMethod removida de Reservations');
    } catch (error) {
      console.error('❌ Error al revertir migración:', error);
      throw error;
    }
  }
};
