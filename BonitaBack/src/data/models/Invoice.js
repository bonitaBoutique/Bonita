const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define(
    "Invoice",
    {
      
      buyerId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "Users",
          key: "n_document",
        },
      },
      sellerId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "SellerData",
          key: "sdocno",
        },
      },
      invoiceNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      status: {
        type: DataTypes.ENUM("pending", "sent", "failed"),
        defaultValue: "pending",
      },
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      taxxaResponse: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
    },
    {
      timestamps: true,
    }
  );
};
