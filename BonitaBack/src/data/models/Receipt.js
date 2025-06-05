const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define(
    "Receipt",
    {
      id_receipt: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      // ✅ AGREGAR RELACIÓN CON ORDERDETAIL
      id_orderDetail: {
        type: DataTypes.UUID,
        allowNull: true, // Null para GiftCards
        references: {
          model: "OrderDetails",
          key: "id_orderDetail",
        },
      },
      cashier_document: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "Users",
          key: "n_document",
        },
      },
      buyer_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      buyer_email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      buyer_phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      total_amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      payMethod: {
        type: DataTypes.ENUM(
          "Efectivo",
          "Sistecredito",
          "Addi",
          "Tarjeta",
          "Crédito",
          "Bancolombia",
          "Otro",
          "GiftCard"
        ),
        allowNull: false,
      },
      amount: {
        type: DataTypes.FLOAT,
        allowNull: false, 
      },
      amount2: {
        type: DataTypes.FLOAT,
        allowNull: true, 
      },
      payMethod2: {
        type: DataTypes.ENUM(
          "Efectivo",
          "Sistecredito",
          "Addi",
          "Tarjeta",
          "Crédito",
          "Bancolombia",
          "Otro",
          "GiftCard"
        ),
        allowNull: true,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      estimated_delivery_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      receipt_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      // ✅ AGREGAR CAMPOS PARA ADDI/SISTECREDITO
      discount: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0,
      },
      depositDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Fecha en que se deposita el pago de Addi/Sistecredito'
      },
      depositAmount: {
        type: DataTypes.FLOAT,
        allowNull: true,
        comment: 'Monto depositado'
      },
      depositNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Notas sobre el depósito'
      }
    },
    {
      paranoid: true,
      timestamps: true,
    }
  );
};