'use strict';

const { QueryInterface, Sequelize } = require('sequelize');

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🚀 [MIGRATION] Agregando campo stock_initial a Products...');
    
    try {
      // ✅ 1. Agregar columna stock_initial (nullable primero)
      await queryInterface.addColumn('Products', 'stock_initial', {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Stock inicial del producto (fijo, no cambia)'
      });
      
      console.log('✅ [MIGRATION] Columna stock_initial agregada');
      
      // ✅ 2. Actualizar productos existentes (stock actual = stock inicial)
      await queryInterface.sequelize.query(`
        UPDATE "Products" 
        SET stock_initial = stock 
        WHERE stock_initial IS NULL
      `);
      
      console.log('✅ [MIGRATION] Stock inicial actualizado para productos existentes');
      
      // ✅ 3. Hacer la columna NOT NULL con default
      await queryInterface.changeColumn('Products', 'stock_initial', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Stock inicial del producto (fijo, no cambia)'
      });
      
      console.log('✅ [MIGRATION] Campo stock_initial configurado como NOT NULL');
      
    } catch (error) {
      console.error('❌ [MIGRATION ERROR]:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 [ROLLBACK] Eliminando campo stock_initial...');
    await queryInterface.removeColumn('Products', 'stock_initial');
    console.log('✅ [ROLLBACK] Campo stock_initial eliminado');
  }
};