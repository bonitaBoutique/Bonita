const { DataTypes } = require("sequelize");
//codigo,codigoBarra, fecha,marca,description,codigoProv,price,stock,images,sizes,colors,isOffer

module.exports = (sequelize) => {
  sequelize.define(
    "Product",
    {
      id_product: {
  type: DataTypes.STRING,
  primaryKey: true,
  allowNull: false,
  unique: true,
},

      codigoBarra: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      fecha: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      marca: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      codigoProv: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      priceSell: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
  defaultValue: 0,
      },
      sizes: {
        type: DataTypes.STRING,
      },
      colors: {
        type: DataTypes.STRING, 
        allowNull: true,
      },

      isDian: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      tiendaOnLine: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      tax: {
        type: DataTypes.STRING,
        defaultValue: "IVA",
      },
      tax_included: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      taxes_rate: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      unit: {
        type: DataTypes.STRING,
        defaultValue: "und",
      },
      images: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
        allowNull: true,
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
