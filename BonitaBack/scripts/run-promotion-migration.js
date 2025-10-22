/**
 * Script para ejecutar SOLO la migración de promociones
 * Uso: node scripts/run-promotion-migration.js
 */

const path = require('path');
const { conn: sequelize } = require('../src/data');

async function runPromotionMigration() {
  console.log('🎉 [PROMO] Iniciando migración de tabla promotions...');
  
  try {
    // ✅ 1. Verificar conexión
    await sequelize.authenticate();
    console.log('✅ [DB] Conexión establecida');
    
    // ✅ 2. Crear tabla de migraciones si no existe
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "SequelizeMeta" (
        name VARCHAR(255) PRIMARY KEY
      );
    `);
    
    console.log('✅ [MIGRATOR] Tabla SequelizeMeta lista');
    
    // ✅ 3. Definir nombre de la migración
    const migrationName = '007-create-promotions-table';
    const migrationFile = `${migrationName}.js`;
    const migrationPath = path.join(__dirname, '../migrations', migrationFile);
    
    // ✅ 4. Verificar si ya se ejecutó
    const [results] = await sequelize.query(`
      SELECT name FROM "SequelizeMeta" WHERE name = $1
    `, {
      bind: [migrationName]
    });
    
    if (results.length > 0) {
      console.log(`⚠️  [SKIP] La migración ${migrationName} ya fue ejecutada previamente`);
      console.log('ℹ️  [INFO] La tabla promotions ya debería existir en la base de datos');
      return;
    }
    
    // ✅ 5. Ejecutar migración
    console.log(`🔄 [RUN] Ejecutando ${migrationName}...`);
    
    const migration = require(migrationPath);
    await migration.up(sequelize.getQueryInterface(), sequelize.constructor);
    
    // ✅ 6. Marcar como ejecutada
    await sequelize.query(`
      INSERT INTO "SequelizeMeta" (name) VALUES ($1)
    `, {
      bind: [migrationName]
    });
    
    console.log(`✅ [DONE] ${migrationName} completada exitosamente`);
    
    // ✅ 7. Verificar estructura de la tabla
    const [tableInfo] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'promotions'
      ORDER BY ordinal_position
    `);
    
    console.log('📊 [INFO] Estructura de la tabla promotions:');
    console.table(tableInfo);
    
    // ✅ 8. Verificar índice único
    const [indexes] = await sequelize.query(`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'promotions'
    `);
    
    console.log('🔑 [INFO] Índices creados:');
    console.table(indexes);
    
    console.log('🎉 [SUCCESS] Tabla promotions lista para usar!');
    
  } catch (error) {
    console.error('❌ [ERROR] Error ejecutando migración de promociones:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('🔐 [DB] Conexión cerrada');
  }
}

// ✅ Ejecutar
if (require.main === module) {
  runPromotionMigration();
}

module.exports = runPromotionMigration;
