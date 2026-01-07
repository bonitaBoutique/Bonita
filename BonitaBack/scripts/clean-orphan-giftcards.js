// Script para limpiar GiftCards huérfanas (que referencian Receipts eliminados)
// Ejecutar solo si se desea limpiar datos huérfanos

const { conn: sequelize } = require('../src/data');

async function cleanOrphanGiftCards() {
  try {
    console.log('🔍 Buscando GiftCards huérfanas...');
    
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');
    
    // Buscar GiftCards con id_receipt que no existe en Receipts
    const [orphanGiftCards] = await sequelize.query(`
      SELECT gc.id_giftcard, gc.id_receipt, gc.buyer_email, gc.saldo, gc.estado
      FROM "GiftCards" gc
      WHERE gc.id_receipt IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM "Receipts" r 
        WHERE r.id_receipt = gc.id_receipt
      )
    `);
    
    if (orphanGiftCards.length === 0) {
      console.log('✅ No se encontraron GiftCards huérfanas');
      await sequelize.close();
      return;
    }
    
    console.log(`⚠️ Encontradas ${orphanGiftCards.length} GiftCards huérfanas:`);
    console.table(orphanGiftCards);
    
    // Opción 1: Establecer id_receipt como NULL
    console.log('\n📝 Estableciendo id_receipt como NULL para GiftCards huérfanas...');
    
    const [result] = await sequelize.query(`
      UPDATE "GiftCards"
      SET id_receipt = NULL
      WHERE id_receipt IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM "Receipts" r 
        WHERE r.id_receipt = "GiftCards".id_receipt
      )
    `);
    
    console.log(`✅ ${result[1]} GiftCards actualizadas`);
    
    // Verificar
    const [remaining] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM "GiftCards" gc
      WHERE gc.id_receipt IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM "Receipts" r 
        WHERE r.id_receipt = gc.id_receipt
      )
    `);
    
    console.log(`\n✅ GiftCards huérfanas restantes: ${remaining[0].count}`);
    
    await sequelize.close();
    console.log('✅ Script completado');
    
  } catch (error) {
    console.error('❌ Error:', error);
    await sequelize.close();
    process.exit(1);
  }
}

cleanOrphanGiftCards();
