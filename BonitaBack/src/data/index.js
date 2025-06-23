require('dotenv').config();
// ✅ ASEGURAR QUE SEQUELIZE ESTÉ IMPORTADO CORRECTAMENTE
const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
const {
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT,
  DB_NAME,
  DB_DEPLOY
} = require('../config/envs');

//-------------------------------- CONFIGURACION PARA TRABAJAR LOCALMENTE-----------------------------------
// ❌ COMENTAR TEMPORALMENTE LA CONFIGURACIÓN LOCAL:
// const sequelize = new Sequelize(
//   `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`,
//   {
//     logging: false,
//     native: false,
//   }
// );

//-------------------------------------CONFIGURACION PARA EL DEPLOY---------------------------------------------------------------------
// ✅ USAR LA CONFIGURACIÓN DE RAILWAY:
const sequelize = new Sequelize(DB_DEPLOY, {
  logging: false,
  native: false,
  timezone: '-05:00', // Colombia UTC-5
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  define: {
    timestamps: true,
    // ✅ NO definir timezone aquí, deja que los modelos manejen las fechas
  }
});

// ✅ CONFIGURAR ZONA HORARIA GLOBALMENTE (OPCIONAL)
if (process.env.NODE_ENV === 'production') {
  process.env.TZ = 'America/Bogota';
}

// ✅ RESTO DEL CÓDIGO PARA CARGAR MODELOS
const basename = path.basename(__filename);

const modelDefiners = [];

fs.readdirSync(path.join(__dirname, '/models'))
  .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, '/models', file)));
  });

modelDefiners.forEach(model => model(sequelize));

let entries = Object.entries(sequelize.models);
let capsEntries = entries.map((entry) => [entry[0][0].toUpperCase() + entry[0].slice(1), entry[1]]);
sequelize.models = Object.fromEntries(capsEntries);

// ✅ DESTRUCTURING DE MODELOS
const { 
  Product, 
  Category, 
  SubCategory, 
  OrderDetail, 
  OrderProduct, 
  User, 
  SellerData, 
  Image, 
  Receipt, 
  Expense, 
  Return,
  Delivery, 
  StockMovement, 
  Cotizacion, 
  Reservation, 
  Payment, 
  CreditPayment, 
  Token, 
  Invoice, 
  GiftCard ,
  AddiSistecreditoDeposit
} = sequelize.models;

// ✅ DEFINIR ASOCIACIONES

// =====================================================
// ASOCIACIONES EXISTENTES (mantener como están)
// =====================================================

// OrderDetail <--> Product (Many-to-Many)
OrderDetail.belongsToMany(Product, { through: 'OrderProduct', as: 'products', foreignKey: 'id_orderDetail' });
Product.belongsToMany(OrderDetail, { through: 'OrderProduct', as: 'orders', foreignKey: 'id_product' });

// User --> OrderDetail
OrderDetail.belongsTo(User, { foreignKey: "n_document" });
User.hasMany(OrderDetail, { foreignKey: "n_document" });

// OrderDetail --> Delivery
OrderDetail.hasOne(Delivery, { foreignKey: 'id_orderDetail' });
Delivery.belongsTo(OrderDetail, { foreignKey: 'id_orderDetail' });

// OrderDetail --> Reservation
OrderDetail.hasMany(Reservation, { foreignKey: 'id_orderDetail' });
Reservation.belongsTo(OrderDetail, { foreignKey: 'id_orderDetail' });

// OrderDetail --> Payment
Payment.belongsTo(OrderDetail, { foreignKey: 'id_orderDetail' });
OrderDetail.hasMany(Payment, { foreignKey: 'id_orderDetail' });

// Product --> Image
Product.hasMany(Image, { foreignKey: 'id_product' });
Image.belongsTo(Product, { foreignKey: 'id_product' });

// Product --> StockMovement
Product.hasMany(StockMovement, { foreignKey: 'id_product' });
StockMovement.belongsTo(Product, { foreignKey: 'id_product' });

// OrderDetail --> Invoice
OrderDetail.hasOne(Invoice, { foreignKey: 'id_orderDetail' });
Invoice.belongsTo(OrderDetail, { foreignKey: 'id_orderDetail' });

// Receipt --> OrderDetail
Receipt.belongsTo(OrderDetail, { foreignKey: "id_orderDetail", allowNull: false });
OrderDetail.hasOne(Receipt, { foreignKey: "id_orderDetail" });

// User --> OrderDetail (relación adicional con claves específicas)
User.hasMany(OrderDetail, { foreignKey: 'n_document', sourceKey: 'n_document' });
OrderDetail.belongsTo(User, { foreignKey: 'n_document', targetKey: 'n_document' });

// OrderDetail --> Receipt (relación adicional)
OrderDetail.hasMany(Receipt, { foreignKey: "id_orderDetail" });
Receipt.belongsTo(OrderDetail, { foreignKey: "id_orderDetail", allowNull: false });

// Reservation --> CreditPayment
Reservation.hasMany(CreditPayment, { foreignKey: 'id_reservation' });
CreditPayment.belongsTo(Reservation, { foreignKey: 'id_reservation' });

// Receipt --> User (Cajero)
Receipt.belongsTo(User, { 
  foreignKey: 'cashier_document',
  targetKey: 'n_document',
  as: 'cashier'
});
User.hasMany(Receipt, { 
  foreignKey: 'cashier_document',
  sourceKey: 'n_document',
  as: 'receipts'
});

// Payment --> Receipt
Payment.belongsTo(Receipt, { foreignKey: 'id_receipt' });
Receipt.hasMany(Payment, { foreignKey: 'id_receipt' });

// AddiSistecreditoDeposit --> User
AddiSistecreditoDeposit.belongsTo(User, { 
  foreignKey: 'registeredBy',
  targetKey: 'n_document',
  as: 'registeredByUser'
});
User.hasMany(AddiSistecreditoDeposit, { 
  foreignKey: 'registeredBy',
  sourceKey: 'n_document',
  as: 'addiSistecreditoDeposits'
});


Return.belongsTo(Receipt, { 
  foreignKey: 'original_receipt_id',
  as: 'originalReceipt'
});
Receipt.hasMany(Return, { 
  foreignKey: 'original_receipt_id',
  as: 'returns'
});

// Return --> Receipt (Nuevo Recibo por diferencia - opcional)
Return.belongsTo(Receipt, { 
  foreignKey: 'new_receipt_id',
  as: 'newReceipt'
});
Receipt.hasMany(Return, { 
  foreignKey: 'new_receipt_id',
  as: 'newReceiptReturns'
});


Return.belongsTo(User, { 
  foreignKey: 'cashier_document',
  targetKey: 'n_document',
  as: 'cashier'
});
User.hasMany(Return, { 
  foreignKey: 'cashier_document',
  sourceKey: 'n_document',
  as: 'processedReturns'
});

module.exports = {
  ...sequelize.models,
  conn: sequelize,
};