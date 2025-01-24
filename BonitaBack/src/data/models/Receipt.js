const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define(
    "Receipt",
    {
      id_receipt: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false, // Auto incremento, sin valor predeterminado
      },
      buyer_name: {
        type: DataTypes.STRING,
        allowNull: false, // Nombre del comprador (obligatorio)
      },
      buyer_email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: true, // Validación de email
        },
      },
      buyer_phone: {
        type: DataTypes.STRING,
        allowNull: true, // Teléfono del comprador (opcional)
      },
      total_amount: {
        type: DataTypes.FLOAT,
        allowNull: false, // Monto total del recibo
      },
      payMethod: {
        type: DataTypes.ENUM(
          "Efectivo",
          "Sistecredito",
          "Addi",
          "Tarjeta",
          "Crédito",
          "Bancolombia",
          "Otro"
        ),         
        
      },
      date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW, // Fecha de emisión del recibo
      },
    },
    {
      timestamps: true, // Manejo de createdAt y updatedAt
    }
  );
};
