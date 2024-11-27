const { DataTypes } = require("sequelize");
//codigo,codigoBarra, fecha,marca,description,codigoProv,price,stock,images,sizes,colors,isOffer

module.exports = (sequelize) => {
  sequelize.define(
    "Product",
    {
      id_product: {
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
        type: DataTypes.STRING, 
        
      },
      colors: {
        type: DataTypes.STRING, // Usar TEXT en lugar de STRING
        allowNull: true,
      },

      
    isDian: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
     
     
      tax_classification: {
        type: DataTypes.STRING,
        defaultValue: "IVA",
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
        defaultValue: "und",
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
