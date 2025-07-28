'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🚀 [MIGRATION] Mejorando tabla StockMovements...');
    
    try {
      // ✅ 1. Crear ENUMs primero
      await queryInterface.sequelize.query(`
        DO $$ BEGIN
          CREATE TYPE enum_StockMovements_reason AS ENUM ('SALE', 'PURCHASE', 'RETURN', 'ADJUSTMENT', 'INITIAL');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);
      
      await queryInterface.sequelize.query(`
        DO $$ BEGIN
          CREATE TYPE enum_StockMovements_reference_type AS ENUM ('ORDER', 'RECEIPT', 'RETURN', 'MANUAL');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);
      
      // ✅ 2. Agregar nuevas columnas
      await queryInterface.addColumn('StockMovements', 'reason', {
        type: 'enum_StockMovements_reason',
        allowNull: true,
        comment: 'Razón del movimiento de stock'
      });
      
      await queryInterface.addColumn('StockMovements', 'reference_id', {
        type: Sequelize.UUID,
        allowNull: true,
        comment: 'ID de referencia (OrderDetail, Receipt, etc.)'
      });
      
      await queryInterface.addColumn('StockMovements', 'reference_type', {
        type: 'enum_StockMovements_reference_type',
        allowNull: true,
        comment: 'Tipo de referencia del movimiento'
      });
      
      await queryInterface.addColumn('StockMovements', 'unit_price', {
        type: Sequelize.FLOAT,
        allowNull: true,
        comment: 'Precio unitario al momento del movimiento'
      });
      
      await queryInterface.addColumn('StockMovements', 'notes', {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Notas adicionales del movimiento'
      });
      
      console.log('✅ [MIGRATION] Campos agregados a StockMovements');
      
    } catch (error) {
      console.error('❌ [MIGRATION ERROR]:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 [ROLLBACK] Eliminando campos de StockMovements...');
    
    await queryInterface.removeColumn('StockMovements', 'reason');
    await queryInterface.removeColumn('StockMovements', 'reference_id');
    await queryInterface.removeColumn('StockMovements', 'reference_type');
    await queryInterface.removeColumn('StockMovements', 'unit_price');
    await queryInterface.removeColumn('StockMovements', 'notes');
    
    // ✅ Eliminar ENUMs
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_StockMovements_reason;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_StockMovements_reference_type;');
    
    console.log('✅ [ROLLBACK] Campos eliminados de StockMovements');
  }
};