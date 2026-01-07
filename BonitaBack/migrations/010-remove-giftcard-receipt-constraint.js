// Migración: Eliminar foreign key constraint de GiftCards a Receipts
// Fecha: 2026-01-06
// Descripción: Elimina el constraint GiftCards_id_receipt_fkey para permitir GiftCards huérfanas

const { Sequelize } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    try {
      console.log('🔄 Eliminando constraint GiftCards_id_receipt_fkey...');
      
      // Primero, limpiar GiftCards huérfanas estableciendo id_receipt a NULL
      await queryInterface.sequelize.query(`
        UPDATE "GiftCards"
        SET id_receipt = NULL
        WHERE id_receipt IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM "Receipts" r 
          WHERE r.id_receipt = "GiftCards".id_receipt
        );
      `);
      
      console.log('✅ GiftCards huérfanas limpiadas');

      // Eliminar el constraint si existe
      await queryInterface.sequelize.query(`
        ALTER TABLE "GiftCards" 
        DROP CONSTRAINT IF EXISTS "GiftCards_id_receipt_fkey";
      `);

      console.log('✅ Constraint eliminado correctamente');

    } catch (error) {
      console.error('❌ Error en migración:', error);
      // No lanzar error si el constraint no existe
      if (error.message.includes('does not exist')) {
        console.log('ℹ️ Constraint no existe, continuando...');
        return;
      }
      throw error;
    }
  },

  down: async (queryInterface) => {
    try {
      console.log('🔄 Revertiendo: Recreando constraint GiftCards_id_receipt_fkey...');
      
      // Primero limpiar datos inconsistentes
      await queryInterface.sequelize.query(`
        UPDATE "GiftCards"
        SET id_receipt = NULL
        WHERE id_receipt IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM "Receipts" r 
          WHERE r.id_receipt = "GiftCards".id_receipt
        );
      `);
      
      // Recrear el constraint
      await queryInterface.sequelize.query(`
        ALTER TABLE "GiftCards"
        ADD CONSTRAINT "GiftCards_id_receipt_fkey"
        FOREIGN KEY (id_receipt)
        REFERENCES "Receipts" (id_receipt)
        ON DELETE SET NULL
        ON UPDATE CASCADE;
      `);
      
      console.log('✅ Constraint recreado');
    } catch (error) {
      console.error('❌ Error al revertir migración:', error);
      throw error;
    }
  }
};
