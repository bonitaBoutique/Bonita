const { DataTypes } = require("sequelize");
//codigo,
codigoBarra, fecha,marca,description,codigoProv,price,stock,images,sizes,colors,isOffer

module.exports = (sequelize) => {
  sequelize.define(
    "Product",
    {
      codigo: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
      },

      codigoBarra: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      fecha: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      marca: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      codigoProv: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      
      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      stock: {
        type: DataTypes.INTEGER,
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
      isOffer: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isDian: {
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
