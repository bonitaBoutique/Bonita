const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define(
    "Return",
    {
      id_return: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
      },
      original_receipt_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      return_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      cashier_document: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('Procesada', 'Pendiente', 'Cancelada'),
        allowNull: false,
        defaultValue: 'Pendiente'
      },
      // Montos calculados
      total_returned: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      total_new_purchase: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      difference_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        comment: "Positivo: cliente debe pagar, Negativo: se le devuelve"
      },
      // Referencias a nuevos registros generados
      new_receipt_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      // ❌ ELIMINADA COMPLETAMENTE - giftcard_id
      // La gestión de GiftCards se hará desde otro componente
      
      // Datos JSON para productos
      returned_products: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: "JSON array de productos devueltos"
      },
      new_products: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "JSON array de nuevos productos (opcional)"
      }
    },
    {
      paranoid: true,
      timestamps: true,
    }
  );
};