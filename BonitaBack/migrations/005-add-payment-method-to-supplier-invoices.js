/**
 * Migration: Add payment_method column to supplier_invoices table
 * Date: 2025-10-14
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('🔄 [MIGRATION 005] Verificando columna payment_method en supplier_invoices...');
    
    try {
      // Verificar si la columna ya existe
      const tableDescription = await queryInterface.describeTable('supplier_invoices');
      
      if (tableDescription.payment_method) {
        console.log('ℹ️ [MIGRATION 005] La columna payment_method ya existe. Omitiendo...');
        return;
      }

      // Si no existe, agregarla
      await queryInterface.addColumn('supplier_invoices', 'payment_method', {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Medio de pago (Efectivo, Transferencia, Nequi, Crédito)',
      });
      
      console.log('✅ [MIGRATION 005] Columna payment_method agregada exitosamente');
    } catch (error) {
      console.error('❌ [MIGRATION 005] Error:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.log('🔄 [MIGRATION 005] Revirtiendo: Verificando columna payment_method...');
    
    try {
      // Verificar si la columna existe antes de eliminarla
      const tableDescription = await queryInterface.describeTable('supplier_invoices');
      
      if (!tableDescription.payment_method) {
        console.log('ℹ️ [MIGRATION 005] La columna payment_method no existe. Omitiendo...');
        return;
      }

      // Si existe, eliminarla
      await queryInterface.removeColumn('supplier_invoices', 'payment_method');
      
      console.log('✅ [MIGRATION 005] Columna payment_method eliminada exitosamente');
    } catch (error) {
      console.error('❌ [MIGRATION 005] Error en rollback:', error);
      throw error;
    }
  }
};
