const { DB_DEPLOY } = require('../src/config/envs');

module.exports = {
  development: {
    url: DB_DEPLOY,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  },
  production: {
    url: DB_DEPLOY,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};