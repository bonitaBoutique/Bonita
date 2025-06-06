const { 
  DB_USER,
  DB_PASSWORD, 
  DB_HOST,
  DB_PORT,
  DB_NAME,
  DB_DEPLOY 
} = require('../src/config/envs');

module.exports = {
  development: {
    username: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'postgres', // ← Cambiar a postgres
    logging: false,
    // Para desarrollo local sin SSL
    dialectOptions: process.env.NODE_ENV === 'production' ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {}
  },
  test: {
    username: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME + '_test',
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'postgres',
    logging: false
  },
  production: {
    use_env_variable: 'DB_DEPLOY', // ← Usar variable de entorno
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};