const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Supplier = sequelize.define(
    "Supplier",
    {
      id_supplier: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      business_name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "Razón social del proveedor",
      },
      document_type: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: "NIT",
        comment: "Tipo de documento (NIT, CC, CE, etc.)",
      },
      document_number: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: "Número de documento único",
      },
      contact_name: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Nombre del contacto principal",
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isEmail: true,
        },
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      country: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "Colombia",
      },
      category: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Categoría del proveedor (Textil, Accesorios, etc.)",
      },
      payment_terms: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Términos de pago (Contado, 30 días, etc.)",
      },
      bank_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      bank_account: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("active", "inactive"),
        defaultValue: "active",
        allowNull: false,
      },
    },
    {
      tableName: "suppliers",
      timestamps: true,
      paranoid: true, // Soft delete
      indexes: [
        {
          unique: true,
          fields: ["document_number"],
        },
        {
          fields: ["business_name"],
        },
        {
          fields: ["status"],
        },
      ],
    }
  );

  return Supplier;
};
