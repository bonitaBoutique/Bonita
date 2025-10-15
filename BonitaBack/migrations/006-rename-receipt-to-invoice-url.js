/**
 * Migration: Rename receipt_url to invoice_url in supplier_invoices table
 * Date: 2025-10-15
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('🔄 [MIGRATION 006] Renombrando receipt_url a invoice_url en supplier_invoices...');
    
    try {
      const tableDescription = await queryInterface.describeTable('supplier_invoices');
      
      // Verificar si la columna receipt_url existe
      if (tableDescription.receipt_url) {
        // Renombrar receipt_url a invoice_url
        await queryInterface.renameColumn('supplier_invoices', 'receipt_url', 'invoice_url');
        console.log('✅ [MIGRATION 006] Columna receipt_url → invoice_url renombrada');
      } else if (tableDescription.invoice_url) {
        console.log('ℹ️ [MIGRATION 006] La columna invoice_url ya existe. Omitiendo...');
      } else {
        console.log('⚠️ [MIGRATION 006] No se encontró receipt_url ni invoice_url');
      }

      // Verificar si receipt_public_id existe
      if (tableDescription.receipt_public_id) {
        // Renombrar receipt_public_id a invoice_public_id
        await queryInterface.renameColumn('supplier_invoices', 'receipt_public_id', 'invoice_public_id');
        console.log('✅ [MIGRATION 006] Columna receipt_public_id → invoice_public_id renombrada');
      } else if (tableDescription.invoice_public_id) {
        console.log('ℹ️ [MIGRATION 006] La columna invoice_public_id ya existe. Omitiendo...');
      }
      
      console.log('✅ [MIGRATION 006] Migración completada exitosamente');
    } catch (error) {
      console.error('❌ [MIGRATION 006] Error:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.log('🔄 [MIGRATION 006] Revirtiendo: Renombrando invoice_url a receipt_url...');
    
    try {
      const tableDescription = await queryInterface.describeTable('supplier_invoices');
      
      if (tableDescription.invoice_url) {
        await queryInterface.renameColumn('supplier_invoices', 'invoice_url', 'receipt_url');
        console.log('✅ [MIGRATION 006] Columna invoice_url → receipt_url revertida');
      }

      if (tableDescription.invoice_public_id) {
        await queryInterface.renameColumn('supplier_invoices', 'invoice_public_id', 'receipt_public_id');
        console.log('✅ [MIGRATION 006] Columna invoice_public_id → receipt_public_id revertida');
      }
      
      console.log('✅ [MIGRATION 006] Reversión completada exitosamente');
    } catch (error) {
      console.error('❌ [MIGRATION 006] Error en reversión:', error);
      throw error;
    }
  }
};
