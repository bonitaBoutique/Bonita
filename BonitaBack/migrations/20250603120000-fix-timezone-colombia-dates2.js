'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('Iniciando migración para agregar timestamps a OrderDetails...');
    
    try {
      const transaction = await queryInterface.sequelize.transaction();

      try {
        // 1. Agregar columna createdAt como nullable primero
        await queryInterface.addColumn('OrderDetails', 'createdAt', {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: null
        }, { transaction });

        // 2. Agregar columna updatedAt como nullable primero  
        await queryInterface.addColumn('OrderDetails', 'updatedAt', {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: null
        }, { transaction });

        // 3. Actualizar todos los registros existentes con fecha de Colombia
        // Para createdAt, usar la fecha de la columna 'date' existente si está disponible
        await queryInterface.sequelize.query(`
          UPDATE "OrderDetails" 
          SET 
            "createdAt" = COALESCE(
              "date"::timestamp AT TIME ZONE 'America/Bogota',
              CURRENT_TIMESTAMP AT TIME ZONE 'America/Bogota'
            ),
            "updatedAt" = CURRENT_TIMESTAMP AT TIME ZONE 'America/Bogota'
          WHERE "createdAt" IS NULL OR "updatedAt" IS NULL;
        `, { transaction });

        // 4. Ahora hacer las columnas NOT NULL
        await queryInterface.changeColumn('OrderDetails', 'createdAt', {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP AT TIME ZONE 'America/Bogota'")
        }, { transaction });

        await queryInterface.changeColumn('OrderDetails', 'updatedAt', {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP AT TIME ZONE 'America/Bogota'")
        }, { transaction });

        // 5. Asegurar que la columna date tenga el tipo correcto
        await queryInterface.changeColumn('OrderDetails', 'date', {
          type: Sequelize.DATEONLY,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_DATE")
        }, { transaction });

        await transaction.commit();
        console.log('Migración completada exitosamente');

      } catch (error) {
        await transaction.rollback();
        throw error;
      }

    } catch (error) {
      console.error('Error en migración:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.log('Revirtiendo migración de timestamps...');
    
    try {
      // Remover las columnas agregadas
      await queryInterface.removeColumn('OrderDetails', 'createdAt');
      await queryInterface.removeColumn('OrderDetails', 'updatedAt');
      
      console.log('Migración revertida');
    } catch (error) {
      console.error('Error revirtiendo migración:', error);
      throw error;
    }
  }
};