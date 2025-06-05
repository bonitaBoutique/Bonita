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
    },
    useUTC: false,
    dateStrings: true,
    typeCast: true
  }
});

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
  GiftCard 
} = sequelize.models;

// ✅ DEFINIR ASOCIACIONES
Product.belongsTo(Category, { foreignKey: 'categoryId' });
Category.hasMany(Product, { foreignKey: 'categoryId' });

Product.belongsTo(SubCategory, { foreignKey: 'subCategoryId' });
SubCategory.hasMany(Product, { foreignKey: 'subCategoryId' });

Category.hasMany(SubCategory, { foreignKey: 'categoryId' });
SubCategory.belongsTo(Category, { foreignKey: 'categoryId' });

OrderDetail.belongsToMany(Product, { through: OrderProduct, foreignKey: 'id_orderDetail' });
Product.belongsToMany(OrderDetail, { through: OrderProduct, foreignKey: 'id_product' });

OrderDetail.hasMany(OrderProduct, { foreignKey: 'id_orderDetail', as: 'orderProducts' });
OrderProduct.belongsTo(OrderDetail, { foreignKey: 'id_orderDetail' });

Product.hasMany(OrderProduct, { foreignKey: 'id_product' });
OrderProduct.belongsTo(Product, { foreignKey: 'id_product', as: 'product' });

Product.hasMany(Image, { foreignKey: 'id_product' });
Image.belongsTo(Product, { foreignKey: 'id_product' });

Product.hasMany(StockMovement, { foreignKey: 'id_product' });
StockMovement.belongsTo(Product, { foreignKey: 'id_product' });

OrderDetail.hasOne(Invoice, { foreignKey: 'id_orderDetail' });
Invoice.belongsTo(OrderDetail, { foreignKey: 'id_orderDetail' });

OrderDetail.hasMany(Reservation, { foreignKey: "id_orderDetail" });
Reservation.belongsTo(OrderDetail, { foreignKey: "id_orderDetail" });

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



User.hasMany(OrderDetail, { foreignKey: 'n_document', sourceKey: 'n_document' });
OrderDetail.belongsTo(User, { foreignKey: 'n_document', targetKey: 'n_document' });

Receipt.belongsTo(OrderDetail, { 
  foreignKey: "id_orderDetail", 
  as: "orderDetail", // ← Nueva relación para Addi/Sistecredito
  allowNull: false 
});

OrderDetail.hasOne(Receipt, { 
  foreignKey: "id_orderDetail",
  as: "receipt" // ← Relación inversa
});



module.exports = {
  ...sequelize.models,
  conn: sequelize,
};