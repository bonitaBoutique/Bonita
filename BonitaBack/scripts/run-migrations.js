const fs = require('fs');
const path = require('path');
const { conn: sequelize } = require('../src/data');

async function runMigrations() {
  console.log('🚀 [MIGRATOR] Iniciando migraciones de stock...');
  
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
    
    // ✅ 3. Leer archivos de migración
    const migrationsDir = path.join(__dirname, '../migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.js') && !file.includes('rollback'))
      .sort();
    
    console.log(`📁 [MIGRATOR] Encontrados ${migrationFiles.length} archivos de migración`);
    
    // ✅ 4. Ejecutar migraciones en orden
    for (const file of migrationFiles) {
      const migrationName = file.replace('.js', '');
      
      // Verificar si ya se ejecutó
      const [results] = await sequelize.query(`
        SELECT name FROM "SequelizeMeta" WHERE name = $1
      `, {
        bind: [migrationName]
      });
      
      if (results.length > 0) {
        console.log(`⏭️  [SKIP] ${migrationName} ya ejecutada`);
        continue;
      }
      
      console.log(`🔄 [RUN] Ejecutando ${migrationName}...`);
      
      try {
        // Cargar y ejecutar migración
        const migration = require(path.join(migrationsDir, file));
        await migration.up(sequelize.getQueryInterface(), sequelize.constructor);
        
        // Marcar como ejecutada
        await sequelize.query(`
          INSERT INTO "SequelizeMeta" (name) VALUES ($1)
        `, {
          bind: [migrationName]
        });
        
        console.log(`✅ [DONE] ${migrationName} completada exitosamente`);
        
      } catch (migrationError) {
        console.error(`❌ [ERROR] Error en migración ${migrationName}:`, migrationError.message);
        throw migrationError;
      }
    }
    
    console.log('🎉 [SUCCESS] Todas las migraciones ejecutadas exitosamente!');
    
    // ✅ 5. Verificar estructura final
    const [tableInfo] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name IN ('Products', 'StockMovements')
      ORDER BY table_name, ordinal_position
    `);
    
    console.log('📊 [INFO] Estructura final de tablas:');
    console.table(tableInfo);
    
  } catch (error) {
    console.error('❌ [FATAL] Error ejecutando migraciones:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('🔐 [DB] Conexión cerrada');
  }
}

// ✅ Ejecutar si se llama directamente
if (require.main === module) {
  runMigrations();
}

module.exports = runMigrations;