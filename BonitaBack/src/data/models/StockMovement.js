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
        type: DataTypes.STRING, // Debe coincidir con Product.id_product
        allowNull: false,
        references: {
          model: "Products", // Nombre de la tabla relacionada
          key: "id_product",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
  type: {
    type: DataTypes.ENUM('IN', 'OUT'), // IN: incremento, OUT: decremento
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },

})
}
