const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    sequelize.define('GiftCard', {
      id_giftcard: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_receipt: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      buyer_email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      saldo: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      estado: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'activa',
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    }, );
  
   
  };