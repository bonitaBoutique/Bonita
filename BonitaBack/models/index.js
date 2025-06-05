'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';

// ✅ CORREGIR: Usar tu archivo de configuración de envs
const {
  DB_USER,
  DB_PASSWORD, 
  DB_HOST,
  DB_PORT,
  DB_NAME,
  DB_DEPLOY
} = require('../src/config/envs');

const db = {};

let sequelize;
if (env === 'production' && DB_DEPLOY) {
  sequelize = new Sequelize(DB_DEPLOY, {
    dialect: 'postgresql',
    logging: false,
    native: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  sequelize = new Sequelize(
    `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`,
    {
      logging: false,
      native: false,
    }
  );
}

// ✅ CORREGIR: Leer modelos desde tu carpeta actual
const modelsPath = path.join(__dirname, '../src/data/models');

fs
  .readdirSync(modelsPath)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(modelsPath, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
