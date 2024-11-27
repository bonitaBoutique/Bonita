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
const { User, Product,  Category, Delivery, OrderDetail, Payment, Image, OrderProduct, SubCategory } = sequelize.models;

OrderDetail.hasMany(Product, {
  foreignKey: 'id_orderDetail',
  as: 'products'
});
Product.belongsTo(OrderDetail, {
  foreignKey: 'id_orderDetail',
  as: 'orderDetail'
});
//User --> Order
OrderDetail.belongsTo(User,{foreignKey:"n_document"})
User.hasMany(OrderDetail,{foreignKey: "n_document"})

//Product --> Category
Product.belongsTo(Category,{foreignKey:"id_category"})
Category.hasMany(Product,{foreignKey: "id_category"})

//Order --> Delivery
OrderDetail.hasOne(Delivery, { foreignKey: 'id_orderDetail' });
Delivery.belongsTo(OrderDetail, { foreignKey: 'id_orderDetail' });


// //OrderDetail ---> Product
// OrderDetail.belongsTo(Product, { foreignKey: 'id_product' });
// Product.hasMany(OrderDetail, { foreignKey: 'id_product' });

//Order ---> Payment
Payment.belongsTo(OrderDetail, { foreignKey: 'id_orderDetail' });
OrderDetail.hasMany(Payment, { foreignKey: 'id_orderDetail' });

//Product ---> Image
Product.hasMany(Image, { foreignKey: 'id_product' });
Image.belongsTo(Product, { foreignKey: 'id_product' });

Category.hasMany(SubCategory, {foreignKey: 'id_category'})
SubCategory.belongsTo(Category, {foreingKey: 'id_category'})

Product.belongsTo(SubCategory,{foreignKey:"id_SB"})
SubCategory.hasMany(Product,{foreignKey: "id_SB"})


//---------------------------------------------------------------------------------//
module.exports = {
  ...sequelize.models, // para poder importar los modelos así: const { Product, User } = require('./db.js');
  conn: sequelize, // para importart la conexión { conn } = require('./db.js');
};
