const { QueryInterface, DataTypes } = require("sequelize");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log("🔄 [MIGRATION 004] Mejorando modelo GiftCard...");
    
    try {
      // Función helper para agregar columna solo si no existe
      const addColumnIfNotExists = async (tableName, columnName, columnOptions) => {
        try {
          const tableDescription = await queryInterface.describeTable(tableName);
          if (!tableDescription[columnName]) {
            await queryInterface.addColumn(tableName, columnName, columnOptions);
            console.log(`✅ Campo ${columnName} agregado`);
          } else {
            console.log(`⏭️ Campo ${columnName} ya existe, saltando...`);
          }
        } catch (error) {
          console.log(`⏭️ Campo ${columnName} ya existe, saltando...`);
        }
      };

      // ✅ AGREGAR: Campos adicionales para mejor tracking de GiftCards
      await addColumnIfNotExists('GiftCards', 'buyer_name', {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Nombre del comprador de la GiftCard'
      });

      await addColumnIfNotExists('GiftCards', 'buyer_phone', {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Teléfono del comprador de la GiftCard'
      });

      await addColumnIfNotExists('GiftCards', 'payment_method', {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Método de pago utilizado para crear la GiftCard'
      });

      await addColumnIfNotExists('GiftCards', 'description', {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Descripción o notas sobre la GiftCard'
      });

      await addColumnIfNotExists('GiftCards', 'reference_id', {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'ID de referencia (recibo, devolución, etc.)'
      });

      await addColumnIfNotExists('GiftCards', 'reference_type', {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Tipo de referencia (RETURN_CREDIT, PURCHASE, etc.)'
      });

      console.log("✅ [MIGRATION 004] Campos agregados exitosamente a GiftCards");

    } catch (error) {
      console.error("❌ [MIGRATION 004] Error:", error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.log("🔄 [MIGRATION 004] Revirtiendo cambios en GiftCard...");
    
    try {
      await queryInterface.removeColumn('GiftCards', 'buyer_name');
      await queryInterface.removeColumn('GiftCards', 'buyer_phone');
      await queryInterface.removeColumn('GiftCards', 'payment_method');
      await queryInterface.removeColumn('GiftCards', 'description');
      await queryInterface.removeColumn('GiftCards', 'reference_id');
      await queryInterface.removeColumn('GiftCards', 'reference_type');

      console.log("✅ [MIGRATION 004] Revertido exitosamente");

    } catch (error) {
      console.error("❌ [MIGRATION 004] Error en revert:", error);
      throw error;
    }
  }
};