const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define(
    "Product",
    {
      id_product: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      sizes: {
        type: DataTypes.TEXT, 
        allowNull: true,
        get() {
          const value = this.getDataValue("sizes");
          return value ? JSON.parse(value) : [];
        },
        set(value) {
          this.setDataValue("sizes", JSON.stringify(value));
        },
      },
      colors: {
        type: DataTypes.TEXT, // Usar TEXT en lugar de STRING
        allowNull: true,
        get() {
          const value = this.getDataValue("colors");
          return value ? JSON.parse(value) : [];
        },
        set(value) {
          this.setDataValue("colors", JSON.stringify(value));
        },
      },
      materials: {
        type: DataTypes.TEXT, // Usar TEXT en lugar de STRING
        allowNull: true,
        get() {
          const value = this.getDataValue("materials");
          return value ? JSON.parse(value) : [];
        },
        set(value) {
          this.setDataValue("materials", JSON.stringify(value));
        },
      },

      stock: {
        type: DataTypes.INTEGER,
      },
      isOffer: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
      stock_control: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      section: {
        type: DataTypes.ENUM("Caballero", "Dama", "Unisex"),
        allowNull: true,
      },
      tax_classification: {
        type: DataTypes.STRING,
        defaultValue: "Taxed",
      },
      tax_included: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      tax_consumption_value: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      taxes_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      prices_currency_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      prices_price_list_position: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      unit: {
        type: DataTypes.STRING,
        defaultValue: "94",
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
    },
    {
      paranoid: true,
    }
  );
};
