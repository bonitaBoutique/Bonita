require('dotenv').config();
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
const sequelize = new Sequelize(
  `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`,
  {
    logging: false, // set to console.log to see the raw SQL queries
    native: false, // lets Sequelize know we can use pg-native for ~30% more speed
  }
);
//-------------------------------------CONFIGURACION PARA EL DEPLOY---------------------------------------------------------------------
// const sequelize = new Sequelize(DB_DEPLOY , {
//       logging: false, // set to console.log to see the raw SQL queries
//       native: false, // lets Sequelize know we can use pg-native for ~30% more speed
//     }
//   );

const basename = path.basename(__filename);

const modelDefiners = [];

// Leemos todos los archivos de la carpeta Models, los requerimos y agregamos al arreglo modelDefiners
fs.readdirSync(path.join(__dirname, '/models'))
  .filter(
    (file) =>
      file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
  )
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, '/models', file)));
  });

// Injectamos la conexion (sequelize) a todos los modelos
modelDefiners.forEach((model) => model(sequelize));
// Capitalizamos los nombres de los modelos ie: product => Product
let entries = Object.entries(sequelize.models);
let capsEntries = entries.map((entry) => [
  entry[0][0].toUpperCase() + entry[0].slice(1),
  entry[1],
]);
sequelize.models = Object.fromEntries(capsEntries);

// En sequelize.models están todos los modelos importados como propiedades
// Para relacionarlos hacemos un destructuring
const { User, Receipt, Product, StockMovement, CreditPayment , Expense, Reservation,  Delivery,  OrderDetail, Payment, Image, OrderProduct, SubCategory, Invoice, Token } = sequelize.models;

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

//---------------------------------------------------------------------------------//
module.exports = {
  ...sequelize.models, // para poder importar los modelos así: const { Product, User } = require('./db.js');
  conn: sequelize, // para importart la conexión { conn } = require('./db.js');
};
