const app = require('./src/app.js');
const { conn } = require('./src/data');
const { PORT } = require('./src/config/envs.js');
const { Sequelize } = require('sequelize');
const { Umzug, SequelizeStorage } = require('umzug');
const path = require('path');
require('./src/utils/dbBackup.js');
require('dotenv').config();

// Syncing all the models at once.
conn.sync({ alter: true }).then(async () => {
  const umzug = new Umzug({
    migrations: {
      glob: 'migrations/*.js', // Changed from pattern to glob
      resolve: ({ name, path, context }) => {
        const migration = require(path);
        return {
          name,
          up: async () => migration.up(context, Sequelize),
          down: async () => migration.down(context, Sequelize),
        };
      },
    },
    context: conn.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize: conn }),
    logger: console,
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
