const app = require('./src/app.js');
const { conn } = require('./src/data');
const { PORT } = require('./src/config/envs.js');
const { Sequelize } = require('sequelize');
const { Umzug, SequelizeStorage } = require('umzug');
const path = require('path');
require('dotenv').config();

// Syncing all the models at once.
conn.sync({ alter: false }).then(async () => {
  // Ejecutar migraciones
  const umzug = new Umzug({
    migrations: {
      path: path.join(__dirname, './migrations'),
      pattern: /\.js$/,
      params: [conn.getQueryInterface(), Sequelize]
    },
    storage: new SequelizeStorage({ sequelize: conn }),
    context: conn.getQueryInterface(),
    logger: console
  });

  try {
    await umzug.up();
    console.log('Migrations executed successfully');
    
    app.listen(PORT, () => {
      console.log(`🚀 listening on port: ${PORT} 🚀`);
    });
  } catch (error) {
    console.error('Error executing migrations:', error);
    process.exit(1);
  }
});
