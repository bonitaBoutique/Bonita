// Script para eliminar el constraint de foreign key GiftCards_id_receipt_fkey
// y limpiar GiftCards huérfanas

const { conn: sequelize } = require('../src/data');

async function fixGiftCardConstraint() {
  try {
    console.log('🔧 Iniciando corrección de constraint GiftCards...');
    
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');
    
    // 1. Verificar si el constraint existe
    const [constraints] = await sequelize.query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'GiftCards' 
      AND constraint_name = 'GiftCards_id_receipt_fkey'
    `);
    
    if (constraints.length === 0) {
      console.log('✅ El constraint no existe, no hay nada que hacer');
      await sequelize.close();
      return;
    }
    
    console.log('⚠️ Constraint encontrado, procediendo a eliminarlo...');
    
    // 2. Primero, limpiar GiftCards huérfanas estableciendo id_receipt a NULL
    console.log('📝 Limpiando GiftCards huérfanas...');
    const [updateResult] = await sequelize.query(`
      UPDATE "GiftCards"
      SET id_receipt = NULL
      WHERE id_receipt IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM "Receipts" r 
        WHERE r.id_receipt = "GiftCards".id_receipt
      )
    `);
    
    console.log(`✅ ${updateResult[1]} GiftCards actualizadas (id_receipt establecido a NULL)`);
    
    // 3. Ahora eliminar el constraint
    console.log('🗑️ Eliminando constraint foreign key...');
    await sequelize.query(`
      ALTER TABLE "GiftCards" 
      DROP CONSTRAINT IF EXISTS "GiftCards_id_receipt_fkey"
    `);
    
    console.log('✅ Constraint eliminado exitosamente');
    
    // 4. Verificar que se eliminó
    const [remaining] = await sequelize.query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'GiftCards' 
      AND constraint_name = 'GiftCards_id_receipt_fkey'
    `);
    
    if (remaining.length === 0) {
      console.log('✅ Verificación: Constraint eliminado correctamente');
    } else {
      console.log('⚠️ El constraint todavía existe');
    }
    
    await sequelize.close();
    console.log('\n✅ Script completado exitosamente');
    console.log('🔄 Ahora puedes reiniciar el servidor');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    await sequelize.close();
    process.exit(1);
  }
}

fixGiftCardConstraint();
