/**
 * Script para agregar campo isConciliated a tabla Receipts
 */

const { conn: sequelize } = require('./src/data');

async function addIsConciliatedColumn() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');

    // Verificar si la columna ya existe
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Receipts' 
      AND column_name = 'isConciliated';
    `);

    if (results.length > 0) {
      console.log('✅ La columna isConciliated ya existe en Receipts');
      process.exit(0);
      return;
    }

    console.log('🔄 Agregando columna isConciliated...');
    
    await sequelize.query(`
      ALTER TABLE "Receipts"
      ADD COLUMN "isConciliated" BOOLEAN DEFAULT FALSE;
    `);

    console.log('✅ Columna isConciliated agregada');

    console.log('✅ Migración completada exitosamente');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

addIsConciliatedColumn();
