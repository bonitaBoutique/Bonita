/**
 * Migration: Agregar índice único para evitar duplicación de GiftCards
 * 
 * Propósito:
 * - Prevenir que se creen múltiples GiftCards para la misma referencia
 * - Agregar índice único compuesto en (reference_id, reference_type)
 * - Agregar índice único en id_receipt para compras directas
 */

const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('🔧 Iniciando migración: Agregar índices únicos a GiftCards...');

    try {
      // 1. Agregar índice único compuesto para reference_id + reference_type
      // Esto previene duplicados en devoluciones
      await queryInterface.addIndex('GiftCards', ['reference_id', 'reference_type'], {
        name: 'giftcards_reference_unique',
        unique: true,
        where: {
          reference_id: { [Sequelize.Op.ne]: null },
          reference_type: { [Sequelize.Op.ne]: null }
        }
      });
      console.log('✅ Índice único agregado: reference_id + reference_type');

      // 2. Agregar índice único para id_receipt
      // Esto previene duplicados en compras directas
      await queryInterface.addIndex('GiftCards', ['id_receipt'], {
        name: 'giftcards_receipt_unique',
        unique: true,
        where: {
          id_receipt: { [Sequelize.Op.ne]: null }
        }
      });
      console.log('✅ Índice único agregado: id_receipt');

      console.log('✅ Migración completada exitosamente');
    } catch (error) {
      console.error('❌ Error en migración:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.log('🔧 Revirtiendo migración: Eliminar índices únicos de GiftCards...');

    try {
      // Eliminar índices en orden inverso
      await queryInterface.removeIndex('GiftCards', 'giftcards_receipt_unique');
      console.log('✅ Índice eliminado: giftcards_receipt_unique');

      await queryInterface.removeIndex('GiftCards', 'giftcards_reference_unique');
      console.log('✅ Índice eliminado: giftcards_reference_unique');

      console.log('✅ Reversión completada exitosamente');
    } catch (error) {
      console.error('❌ Error revirtiendo migración:', error);
      throw error;
    }
  }
};
