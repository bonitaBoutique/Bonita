'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('AddiSistecreditoDeposits', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      platform: {
        type: Sequelize.ENUM("Addi", "Sistecredito"),
        allowNull: false,
        comment: 'Plataforma que realizó el depósito'
      },
      depositDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        comment: 'Fecha en que se recibió el depósito'
      },
      amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
        comment: 'Monto depositado por la plataforma'
      },
      referenceNumber: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Número de referencia del depósito'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descripción o concepto del depósito'
      },
      registeredBy: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'n_document'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'Usuario que registró el depósito'
      },
      status: {
        type: Sequelize.ENUM("Registrado", "Conciliado", "Revisión"),
        allowNull: false,
        defaultValue: "Registrado",
        comment: 'Estado del depósito'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Notas adicionales sobre el depósito'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE
      }
    });

    // Crear índices para optimizar consultas
    await queryInterface.addIndex('AddiSistecreditoDeposits', ['platform'], {
      name: 'idx_addisistecredito_platform'
    });
    
    await queryInterface.addIndex('AddiSistecreditoDeposits', ['depositDate'], {
      name: 'idx_addisistecredito_depositdate'
    });
    
    await queryInterface.addIndex('AddiSistecreditoDeposits', ['status'], {
      name: 'idx_addisistecredito_status'
    });
    
    await queryInterface.addIndex('AddiSistecreditoDeposits', ['registeredBy'], {
      name: 'idx_addisistecredito_registeredby'
    });

    // Índice compuesto para consultas frecuentes
    await queryInterface.addIndex('AddiSistecreditoDeposits', ['platform', 'depositDate'], {
      name: 'idx_addisistecredito_platform_date'
    });
  },

  async down(queryInterface, Sequelize) {
    // Eliminar índices primero
    await queryInterface.removeIndex('AddiSistecreditoDeposits', 'idx_addisistecredito_platform');
    await queryInterface.removeIndex('AddiSistecreditoDeposits', 'idx_addisistecredito_depositdate');
    await queryInterface.removeIndex('AddiSistecreditoDeposits', 'idx_addisistecredito_status');
    await queryInterface.removeIndex('AddiSistecreditoDeposits', 'idx_addisistecredito_registeredby');
    await queryInterface.removeIndex('AddiSistecreditoDeposits', 'idx_addisistecredito_platform_date');
    
    // Eliminar tabla
    await queryInterface.dropTable('AddiSistecreditoDeposits');
  }
};