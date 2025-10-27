const { QueryInterface, DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    console.log('🔄 [MIGRATION] Actualizando ENUMs de métodos de pago...');

    // Lista completa de métodos de pago actualizada
    const newPaymentMethods = [
      'Efectivo',
      'Tarjeta de Crédito',
      'Tarjeta de Débito', 
      'Transferencia',
      'Nequi',
      'Daviplata',
      'Sistecredito',
      'Addi',
      'Bancolombia',
      'GiftCard',
      'Crédito',
      'Otro'
    ];

    try {
      // 1. Actualizar ENUM de payMethod en tabla Receipts
      console.log('📝 Actualizando payMethod en Receipts...');
      await queryInterface.changeColumn('Receipts', 'payMethod', {
        type: DataTypes.ENUM(...newPaymentMethods),
        allowNull: false,
      });

      // 2. Actualizar ENUM de payMethod2 en tabla Receipts  
      console.log('📝 Actualizando payMethod2 en Receipts...');
      await queryInterface.changeColumn('Receipts', 'payMethod2', {
        type: DataTypes.ENUM(...newPaymentMethods),
        allowNull: true,
      });

      // 3. Actualizar ENUM de payMethod en tabla Payments
      console.log('📝 Actualizando payMethod en Payments...');
      await queryInterface.changeColumn('Payments', 'payMethod', {
        type: DataTypes.ENUM(...newPaymentMethods),
        allowNull: true,
      });

      console.log('✅ [MIGRATION] ENUMs de métodos de pago actualizados exitosamente');
    } catch (error) {
      console.error('❌ [MIGRATION] Error actualizando ENUMs:', error.message);
      throw error;
    }
  },

  down: async (queryInterface) => {
    console.log('🔄 [MIGRATION ROLLBACK] Revirtiendo ENUMs de métodos de pago...');

    // Lista anterior de métodos de pago
    const oldPaymentMethodsReceipt = [
      'Efectivo',
      'Tarjeta de Crédito',
      'Tarjeta de Débito',
      'Transferencia', 
      'Nequi',
      'Daviplata',
      'Sistecredito',
      'Addi',
      'Tarjeta',
      'Crédito',
      'Bancolombia',
      'GiftCard',
      'Otro'
    ];

    const oldPaymentMethodsPayment = [
      'Efectivo',
      'Sistecredito',
      'Addi',
      'Tarjeta',
      'Crédito', 
      'Bancolombia',
      'Otro',
      'GiftCard',
      'Nequi'
    ];

    try {
      // Revertir cambios
      await queryInterface.changeColumn('Receipts', 'payMethod', {
        type: DataTypes.ENUM(...oldPaymentMethodsReceipt),
        allowNull: false,
      });

      await queryInterface.changeColumn('Receipts', 'payMethod2', {
        type: DataTypes.ENUM(...oldPaymentMethodsReceipt),
        allowNull: true,
      });

      await queryInterface.changeColumn('Payments', 'payMethod', {
        type: DataTypes.ENUM(...oldPaymentMethodsPayment),
        allowNull: true,
      });

      console.log('✅ [MIGRATION ROLLBACK] ENUMs revertidos exitosamente');
    } catch (error) {
      console.error('❌ [MIGRATION ROLLBACK] Error revirtiendo ENUMs:', error.message);
      throw error;
    }
  }
};