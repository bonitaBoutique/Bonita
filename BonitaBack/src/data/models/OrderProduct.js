const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define("OrderProduct", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    id_orderDetail: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    id_product: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });
};
