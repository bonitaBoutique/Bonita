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
const sequelize = new Sequelize(
  `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`,
  {
    logging: false,
    native: false,
  }
);

//-------------------------------------CONFIGURACION PARA EL DEPLOY---------------------------------------------------------------------
// ✅ USAR LA CONFIGURACIÓN DE RAILWAY:
// const sequelize = new Sequelize(DB_DEPLOY, {
//   logging: false,
//   native: false,
//   timezone: '-05:00', // Colombia UTC-5
//   dialectOptions: {
//     ssl: {
//       require: true,
//       rejectUnauthorized: false
//     },
//     useUTC: false,
//     dateStrings: true,
//     typeCast: true
//   }
// });

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
OrderDetail.belongsToMany(Product, { through: 'OrderProduct', as: 'products', foreignKey: 'id_orderDetail' });

// Product.js
Product.belongsToMany(OrderDetail, { through: 'OrderProduct', as: 'orders', foreignKey: 'id_product' });
//User --> Order
OrderDetail.belongsTo(User,{foreignKey:"n_document"})
User.hasMany(OrderDetail,{foreignKey: "n_document"})



//Order --> Delivery
OrderDetail.hasOne(Delivery, { foreignKey: 'id_orderDetail' });
Delivery.belongsTo(OrderDetail, { foreignKey: 'id_orderDetail' });


OrderDetail.hasMany(Reservation, { foreignKey: 'id_orderDetail' });
Reservation.belongsTo(OrderDetail, { foreignKey: 'id_orderDetail' });

//Order ---> Payment
Payment.belongsTo(OrderDetail, { foreignKey: 'id_orderDetail' });
OrderDetail.hasMany(Payment, { foreignKey: 'id_orderDetail' });

//Product ---> Image
Product.hasMany(Image, { foreignKey: 'id_product' });
Image.belongsTo(Product, { foreignKey: 'id_product' });



Product.hasMany(StockMovement, { foreignKey: 'id_product' });
StockMovement.belongsTo(Product, { foreignKey: 'id_product' });

OrderDetail.hasOne(Invoice, { foreignKey: 'id_orderDetail' });
Invoice.belongsTo(OrderDetail, { foreignKey: 'id_orderDetail' });

OrderDetail.hasMany(Reservation, { foreignKey: "id_orderDetail" });
Reservation.belongsTo(OrderDetail, { foreignKey: "id_orderDetail" });

Receipt.belongsTo(OrderDetail, { foreignKey: "id_orderDetail",allowNull: false,});
OrderDetail.hasOne(Receipt, {foreignKey: "id_orderDetail",});

User.hasMany(OrderDetail, { foreignKey: 'n_document', sourceKey: 'n_document' });
OrderDetail.belongsTo(User, { foreignKey: 'n_document', targetKey: 'n_document' });

OrderDetail.hasMany(Receipt, { foreignKey: "id_orderDetail" });
Receipt.belongsTo(OrderDetail, { foreignKey: "id_orderDetail", allowNull: false });

Reservation.hasMany(CreditPayment, { foreignKey: 'id_reservation' });
CreditPayment.belongsTo(Reservation, { foreignKey: 'id_reservation' });

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
Payment.belongsTo(Receipt, { foreignKey: 'id_receipt' });
Receipt.hasMany(Payment, { foreignKey: 'id_receipt' });

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

module.exports = {
  ...sequelize.models,
  conn: sequelize,
};