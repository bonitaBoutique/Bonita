const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define(
    'OrderProduct',
    {
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
            type: DataTypes.UUID,
            allowNull: false,
          },
        },
  );
};