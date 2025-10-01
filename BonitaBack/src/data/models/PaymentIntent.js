const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define(
    "PaymentIntent",
    {
      id_payment_intent: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      order_reference: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
      },
      wompi_reference: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      integrity_signature: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("PENDING", "APPROVED", "DECLINED", "VOIDED", "ERROR"),
        allowNull: false,
        defaultValue: "PENDING",
      },
      amount_in_cents: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      currency: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "COP",
      },
      shipping_cost: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      discount: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      customer_document: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      customer_email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      customer_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      address_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      delivery_address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      products: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      wompi_transaction_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      raw_transaction: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      order_detail_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
    },
    {
      tableName: "PaymentIntents",
      timestamps: true,
    }
  );
};
