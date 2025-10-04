const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const SupplierPayment = sequelize.define(
    "SupplierPayment",
    {
      id_payment: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      id_invoice: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "supplier_invoices",
          key: "id_invoice",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      id_supplier: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "suppliers",
          key: "id_supplier",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      payment_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: "Fecha del pago",
      },
      amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
        comment: "Monto del pago",
      },
      payment_method: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "Transferencia",
        comment: "Método de pago (Transferencia, Efectivo, Cheque, etc.)",
      },
      reference_number: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "Número de referencia o transacción",
      },
      receipt_url: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "URL de Cloudinary del comprobante de pago",
      },
      receipt_public_id: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Public ID de Cloudinary para eliminar",
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_by: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Usuario que registró el pago",
      },
    },
    {
      tableName: "supplier_payments",
      timestamps: true,
      paranoid: true,
      indexes: [
        {
          fields: ["id_invoice"],
        },
        {
          fields: ["id_supplier"],
        },
        {
          fields: ["payment_date"],
        },
        {
          fields: ["payment_method"],
        },
      ],
    }
  );

  return SupplierPayment;
};
