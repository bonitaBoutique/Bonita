const { Sequelize } = require('sequelize');
const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = require('./src/config/envs');

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'postgres',
  logging: console.log,
});

async function dropSupplierTables() {
  try {
    console.log('🗑️ Eliminando tablas de proveedores...');
    
    // Eliminar en orden inverso debido a las foreign keys
    await sequelize.query('DROP TABLE IF EXISTS "supplier_payments" CASCADE;');
    console.log('✅ Tabla supplier_payments eliminada');
    
    await sequelize.query('DROP TABLE IF EXISTS "supplier_invoices" CASCADE;');
    console.log('✅ Tabla supplier_invoices eliminada');
    
    await sequelize.query('DROP TABLE IF EXISTS "suppliers" CASCADE;');
    console.log('✅ Tabla suppliers eliminada');
    
    console.log('');
    console.log('✅ Todas las tablas de proveedores han sido eliminadas');
    console.log('💡 Ahora puedes reiniciar el servidor con: npm start');
    console.log('   Las tablas se recrearán automáticamente con la estructura correcta.');
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al eliminar tablas:', error);
    process.exit(1);
  }
}

dropSupplierTables();
