const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define(
    "OrderDetail",
    {
      id_orderDetail: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
        comment: 'Order amount before shipping'
      },
      shippingCost: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0,
        comment: 'Shipping cost from MiPaquete'
      },
      shippingProvider: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'MiPaquete shipping provider'
      },
      address: {
        type: DataTypes.ENUM("Envio a domicilio", "Retira en Local", "Coordinar por WhatsApp"),
        allowNull: false,
      },
      deliveryAddress: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      state_order: {
        type: DataTypes.ENUM(
          "Pedido Realizado",
          "En Preparación",
          "Listo para entregar",
          "Envío Realizado",
          "Retirado",
          "Reserva a Crédito" 
        ),
        allowNull: false,
        defaultValue: "Pedido Realizado",
      },
      integritySignature: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      transaction_status: {
        type: DataTypes.ENUM(
          "Pendiente",
          "Aprobado",
          "Rechazado",
          "Fallido",
          "Cancelado"
        ),
        allowNull: false,
        defaultValue: "Pendiente",
      },
      shipping_status: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tracking_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      shipping_company: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      estimated_delivery_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      isFacturable: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      status: {
        type: DataTypes.ENUM("pendiente", "facturada", "cancelada", "completada"),
        allowNull: false,
        defaultValue: "pendiente",
      },
      pointOfSale: {
        type: DataTypes.ENUM("Online", "Local"),
        allowNull: false,
        defaultValue: "Online",
      },
    },
    {
      paranoid: true,
    }
  );
};
