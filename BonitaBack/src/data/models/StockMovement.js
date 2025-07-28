const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define(
    "StockMovement",
    {
      id_movement: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      id_product: {
        type: DataTypes.STRING, 
        allowNull: false,
        references: {
          model: "Products", 
          key: "id_product",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      type: {
        type: DataTypes.ENUM('IN', 'OUT'), 
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
     
      reason: {
        type: DataTypes.ENUM('SALE', 'PURCHASE', 'RETURN', 'ADJUSTMENT', 'INITIAL'),
        allowNull: true,
       
      },
      reference_id: {
        type: DataTypes.UUID,
        allowNull: true,
       
      },
      reference_type: {
        type: DataTypes.ENUM('ORDER', 'RECEIPT', 'RETURN', 'MANUAL'),
        allowNull: true,
       
      },
      unit_price: {
        type: DataTypes.FLOAT,
        allowNull: true,
       
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      estimated_delivery_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      paranoid: true,
      timestamps: true,
    }
  );
};