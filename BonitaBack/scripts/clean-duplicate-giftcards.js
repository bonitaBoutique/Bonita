/**
 * Script: Detectar y limpiar GiftCards duplicadas
 * 
 * Ejecutar ANTES de aplicar la migración 008
 * 
 * Uso:
 *   node scripts/clean-duplicate-giftcards.js
 */

const { GiftCard, Receipt, conn: sequelize } = require('../src/data');

async function findDuplicates() {
  console.log('🔍 Buscando GiftCards duplicadas...\n');

  const results = {
    duplicatesByReceipt: [],
    duplicatesByReference: [],
    orphanedGiftCards: []
  };

  try {
    // 1. Buscar duplicados por id_receipt
    console.log('📋 Verificando duplicados por id_receipt...');
    const giftCardsByReceipt = await GiftCard.findAll({
      where: {
        id_receipt: { [sequelize.Sequelize.Op.ne]: null }
      },
      order: [['id_receipt', 'ASC'], ['createdAt', 'ASC']]
    });

    const receiptMap = new Map();
    for (const gc of giftCardsByReceipt) {
      const key = gc.id_receipt;
      if (!receiptMap.has(key)) {
        receiptMap.set(key, []);
      }
      receiptMap.get(key).push(gc);
    }

    for (const [receiptId, giftCards] of receiptMap) {
      if (giftCards.length > 1) {
        results.duplicatesByReceipt.push({
          id_receipt: receiptId,
          count: giftCards.length,
          giftCards: giftCards.map(gc => ({
            id_giftcard: gc.id_giftcard,
            saldo: gc.saldo,
            estado: gc.estado,
            createdAt: gc.createdAt
          }))
        });
      }
    }

    // 2. Buscar duplicados por reference_id + reference_type
    console.log('📋 Verificando duplicados por reference_id + reference_type...');
    const giftCardsByReference = await GiftCard.findAll({
      where: {
        reference_id: { [sequelize.Sequelize.Op.ne]: null },
        reference_type: { [sequelize.Sequelize.Op.ne]: null }
      },
      order: [['reference_id', 'ASC'], ['reference_type', 'ASC'], ['createdAt', 'ASC']]
    });

    const referenceMap = new Map();
    for (const gc of giftCardsByReference) {
      const key = `${gc.reference_id}-${gc.reference_type}`;
      if (!referenceMap.has(key)) {
        referenceMap.set(key, []);
      }
      referenceMap.get(key).push(gc);
    }

    for (const [refKey, giftCards] of referenceMap) {
      if (giftCards.length > 1) {
        results.duplicatesByReference.push({
          reference: refKey,
          count: giftCards.length,
          giftCards: giftCards.map(gc => ({
            id_giftcard: gc.id_giftcard,
            saldo: gc.saldo,
            estado: gc.estado,
            createdAt: gc.createdAt
          }))
        });
      }
    }

    // 3. Buscar GiftCards sin referencia válida
    console.log('📋 Verificando GiftCards huérfanas...');
    const orphaned = await GiftCard.findAll({
      where: {
        id_receipt: null,
        reference_id: null
      }
    });

    results.orphanedGiftCards = orphaned.map(gc => ({
      id_giftcard: gc.id_giftcard,
      buyer_email: gc.buyer_email,
      saldo: gc.saldo,
      estado: gc.estado,
      createdAt: gc.createdAt
    }));

    // Mostrar resultados
    console.log('\n📊 REPORTE DE DUPLICADOS:\n');
    
    if (results.duplicatesByReceipt.length > 0) {
      console.log(`❌ Duplicados por id_receipt: ${results.duplicatesByReceipt.length}`);
      results.duplicatesByReceipt.forEach(dup => {
        console.log(`   Recibo ${dup.id_receipt}: ${dup.count} GiftCards`);
        dup.giftCards.forEach((gc, i) => {
          console.log(`     ${i === 0 ? '✅ MANTENER' : '🗑️  ELIMINAR'}: ID ${gc.id_giftcard}, Saldo: $${gc.saldo}, Estado: ${gc.estado}`);
        });
      });
    } else {
      console.log('✅ No hay duplicados por id_receipt');
    }

    if (results.duplicatesByReference.length > 0) {
      console.log(`\n❌ Duplicados por reference: ${results.duplicatesByReference.length}`);
      results.duplicatesByReference.forEach(dup => {
        console.log(`   Referencia ${dup.reference}: ${dup.count} GiftCards`);
        dup.giftCards.forEach((gc, i) => {
          console.log(`     ${i === 0 ? '✅ MANTENER' : '🗑️  ELIMINAR'}: ID ${gc.id_giftcard}, Saldo: $${gc.saldo}, Estado: ${gc.estado}`);
        });
      });
    } else {
      console.log('✅ No hay duplicados por reference');
    }

    if (results.orphanedGiftCards.length > 0) {
      console.log(`\n⚠️  GiftCards huérfanas (sin referencia): ${results.orphanedGiftCards.length}`);
      results.orphanedGiftCards.forEach(gc => {
        console.log(`   ID ${gc.id_giftcard}: ${gc.buyer_email}, Saldo: $${gc.saldo}, Estado: ${gc.estado}`);
      });
    } else {
      console.log('\n✅ No hay GiftCards huérfanas');
    }

    return results;

  } catch (error) {
    console.error('❌ Error buscando duplicados:', error);
    throw error;
  }
}

async function cleanDuplicates(dryRun = true) {
  console.log(`\n🧹 ${dryRun ? 'SIMULANDO' : 'EJECUTANDO'} limpieza de duplicados...\n`);

  const transaction = await sequelize.transaction();
  
  try {
    const duplicates = await findDuplicates();
    const idsToDelete = [];

    // Recopilar IDs para eliminar (mantener el más antiguo de cada grupo)
    duplicates.duplicatesByReceipt.forEach(dup => {
      // Mantener el primero (más antiguo), eliminar los demás
      idsToDelete.push(...dup.giftCards.slice(1).map(gc => gc.id_giftcard));
    });

    duplicates.duplicatesByReference.forEach(dup => {
      // Mantener el primero (más antiguo), eliminar los demás
      idsToDelete.push(...dup.giftCards.slice(1).map(gc => gc.id_giftcard));
    });

    if (idsToDelete.length === 0) {
      console.log('✅ No hay duplicados para limpiar');
      await transaction.rollback();
      return;
    }

    console.log(`\n🗑️  Se eliminarán ${idsToDelete.length} GiftCards duplicadas:`);
    console.log(idsToDelete);

    if (!dryRun) {
      const deleted = await GiftCard.destroy({
        where: {
          id_giftcard: idsToDelete
        },
        transaction
      });

      await transaction.commit();
      console.log(`\n✅ ${deleted} GiftCards eliminadas exitosamente`);
    } else {
      await transaction.rollback();
      console.log('\n⚠️  MODO DRY-RUN: No se eliminó nada. Ejecuta con dryRun=false para aplicar cambios.');
    }

  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error limpiando duplicados:', error);
    throw error;
  }
}

// Ejecutar script
async function main() {
  const args = process.argv.slice(2);
  const execute = args.includes('--execute');

  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║  LIMPIEZA DE GIFTCARDS DUPLICADAS                     ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  try {
    if (execute) {
      console.log('⚠️  MODO EJECUCIÓN: Los cambios serán permanentes\n');
      await cleanDuplicates(false);
    } else {
      console.log('ℹ️  MODO SIMULACIÓN: No se realizarán cambios\n');
      console.log('   Para ejecutar la limpieza, usa: node scripts/clean-duplicate-giftcards.js --execute\n');
      await findDuplicates();
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error ejecutando script:', error);
    process.exit(1);
  }
}

main();
