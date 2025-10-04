const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const SupplierInvoice = sequelize.define(
    "SupplierInvoice",
    {
      id_invoice: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
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
      invoice_number: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: "Número de factura del proveedor",
      },
      invoice_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: "Fecha de emisión de la factura",
      },
      due_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: "Fecha de vencimiento del pago",
      },
      total_amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
        },
        comment: "Monto total de la factura",
      },
      paid_amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
        },
        comment: "Monto pagado",
      },
      balance: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.total_amount - this.paid_amount;
        },
      },
      currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
        defaultValue: "COP",
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Descripción de la compra",
      },
      receipt_url: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "URL de Cloudinary del comprobante/factura",
      },
      receipt_public_id: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Public ID de Cloudinary para eliminar",
      },
      tax_amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0,
        comment: "Monto de impuestos (IVA, etc.)",
      },
      status: {
        type: DataTypes.ENUM("pending", "partial", "paid", "overdue", "cancelled"),
        defaultValue: "pending",
        allowNull: false,
        comment: "Estado del pago de la factura",
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "supplier_invoices",
      timestamps: true,
      paranoid: true,
      indexes: [
        {
          fields: ["id_supplier"],
        },
        {
          fields: ["invoice_number"],
        },
        {
          fields: ["invoice_date"],
        },
        {
          fields: ["status"],
        },
        {
          fields: ["due_date"],
        },
      ],
      hooks: {
        beforeSave: (invoice) => {
          // Actualizar estado según el balance
          const balance = invoice.total_amount - invoice.paid_amount;
          
          if (invoice.status === "cancelled") {
            return; // No cambiar si está cancelada
          }
          
          if (balance <= 0) {
            invoice.status = "paid";
          } else if (invoice.paid_amount > 0) {
            invoice.status = "partial";
          } else if (invoice.due_date && new Date(invoice.due_date) < new Date()) {
            invoice.status = "overdue";
          } else {
            invoice.status = "pending";
          }
        },
      },
    }
  );

  return SupplierInvoice;
};
