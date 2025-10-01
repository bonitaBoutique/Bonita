'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🚀 [MIGRATION] Creando tabla PaymentIntents...');
    try {
      await queryInterface.createTable('PaymentIntents', {
        id_payment_intent: {
          type: Sequelize.UUID,
          allowNull: false,
          primaryKey: true,
        },
        order_reference: {
          type: Sequelize.UUID,
          allowNull: false,
          unique: true,
          comment: 'Identificador de orden que se usará al crear el OrderDetail',
        },
        wompi_reference: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
          comment: 'Referencia enviada a Wompi (mismo valor que order_reference por defecto)',
        },
        integrity_signature: {
          type: Sequelize.STRING,
          allowNull: false,
          comment: 'Firma de integridad generada para la sesión de pago',
        },
        status: {
          type: Sequelize.ENUM('PENDING', 'APPROVED', 'DECLINED', 'VOIDED', 'ERROR'),
          allowNull: false,
          defaultValue: 'PENDING',
          comment: 'Estado del intento de pago reportado por Wompi',
        },
        amount_in_cents: {
          type: Sequelize.BIGINT,
          allowNull: false,
          comment: 'Valor total en centavos reportado a Wompi',
        },
        currency: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: 'COP',
        },
        shipping_cost: {
          type: Sequelize.FLOAT,
          allowNull: false,
          defaultValue: 0,
        },
        discount: {
          type: Sequelize.FLOAT,
          allowNull: false,
          defaultValue: 0,
        },
        customer_document: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        customer_email: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        customer_name: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        address_type: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        delivery_address: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        products: {
          type: Sequelize.JSONB,
          allowNull: false,
          comment: 'Snapshot de los productos y cantidades solicitadas',
        },
        metadata: {
          type: Sequelize.JSONB,
          allowNull: true,
          comment: 'Información adicional enviada desde el frontend',
        },
        wompi_transaction_id: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        raw_transaction: {
          type: Sequelize.JSONB,
          allowNull: true,
          comment: 'Payload completo de Wompi para auditoría',
        },
        order_detail_id: {
          type: Sequelize.UUID,
          allowNull: true,
          comment: 'OrderDetail creado tras la aprobación del pago',
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      });

      console.log('✅ [MIGRATION] Tabla PaymentIntents creada.');
    } catch (error) {
      console.error('❌ [MIGRATION ERROR]:', error);
      throw error;
    }
  },

  async down(queryInterface) {
    console.log('🔄 [ROLLBACK] Eliminando tabla PaymentIntents...');
    await queryInterface.dropTable('PaymentIntents');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_PaymentIntents_status";');
    console.log('✅ [ROLLBACK] Tabla PaymentIntents eliminada.');
  },
};
