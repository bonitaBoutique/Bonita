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
  date: {
        type: DataTypes.DATEONLY, // Solo fecha, sin hora
        allowNull: false,
        defaultValue: DataTypes.NOW // Esto tomará la fecha de Colombia
      },
      estimated_delivery_date: {
        type: DataTypes.DATE, // Fecha y hora
        allowNull: true,
      },
 },
    {
      paranoid: true,
      timestamps: true, // Cambiar a true para createdAt/updatedAt
    }
  );
};

