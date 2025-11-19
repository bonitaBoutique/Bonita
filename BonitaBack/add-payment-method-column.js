/**
 * Script directo para agregar paymentMethod a Reservations
 */

const { conn: sequelize } = require('./src/data');

async function addPaymentMethodColumn() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');

    // Verificar si la columna ya existe
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Reservations' 
      AND column_name = 'paymentMethod';
    `);

    if (results.length > 0) {
      console.log('✅ La columna paymentMethod ya existe en Reservations');
      process.exit(0);
      return;
    }

    console.log('🔄 Agregando columna paymentMethod...');
    
    await sequelize.query(`
      ALTER TABLE "Reservations"
      ADD COLUMN "paymentMethod" VARCHAR(255) NULL;
    `);

    console.log('✅ Columna paymentMethod agregada');

    // Actualizar registros existentes
    console.log('🔄 Actualizando registros existentes...');
    
    await sequelize.query(`
      UPDATE "Reservations"
      SET "paymentMethod" = 'Efectivo'
      WHERE "paymentMethod" IS NULL;
    `);

    console.log('✅ Registros actualizados');
    console.log('✅ Migración completada exitosamente');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

addPaymentMethodColumn();
