const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define(
    'Image',
    {
      id_image: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      id_product: {
        type: DataTypes.STRING, // Asegúrate de que coincide con el tipo en `Product`.
        allowNull: false,
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      paranoid: true,
    }
  );
};
