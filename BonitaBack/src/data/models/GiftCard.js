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
      buyer_name: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Nombre del comprador de la GiftCard'
      },
      buyer_phone: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Teléfono del comprador de la GiftCard'
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
      payment_method: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Método de pago utilizado para crear la GiftCard'
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Descripción o notas sobre la GiftCard'
      },
      reference_id: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'ID de referencia (recibo, devolución, etc.)'
      },
      reference_type: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Tipo de referencia (RETURN_CREDIT, PURCHASE, etc.)'
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