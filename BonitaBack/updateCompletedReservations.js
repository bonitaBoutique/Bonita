/**
 * Script para actualizar el estado de las reservas con saldo 0 a "Completada"
 * Esto limpia las reservas antiguas que tienen saldo 0 pero no fueron marcadas como completadas
 */

const { Sequelize } = require('sequelize');
const { DB_USER, DB_PASSWORD, DB_HOST, DB_NAME, DB_PORT } = require('./src/config/envs');

// Crear conexión a la base de datos
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'postgres',
  logging: console.log,
});

async function updateCompletedReservations() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida correctamente\n');

    console.log('📊 Consultando reservas con saldo 0 y estado pendiente...');
    
    // Primero, consultamos cuántas reservas cumplen la condición
    // El saldo se calcula como: (OrderDetail.amount - Reservation.totalPaid)
    const [countResult] = await sequelize.query(`
      SELECT COUNT(*) as total
      FROM "Reservations" r
      INNER JOIN "OrderDetails" od ON r."id_orderDetail" = od."id_orderDetail"
      WHERE (od.amount - COALESCE(r."totalPaid", 0)) = 0 
      AND r.status != 'Completada'
      AND r."deletedAt" IS NULL;
    `);
    
    const totalToUpdate = parseInt(countResult[0].total);
    console.log(`📋 Se encontraron ${totalToUpdate} reservas con saldo 0 pendientes de actualizar\n`);

    if (totalToUpdate === 0) {
      console.log('✅ No hay reservas para actualizar. Todo está al día!');
      await sequelize.close();
      return;
    }

    // Mostramos algunas de las reservas que se van a actualizar
    console.log('📝 Mostrando algunas reservas que se actualizarán:');
    const [sampleReservations] = await sequelize.query(`
      SELECT 
        r.id_reservation,
        r.n_document,
        od.amount as total,
        COALESCE(r."totalPaid", 0) as total_pagado,
        (od.amount - COALESCE(r."totalPaid", 0)) as saldo,
        r.status,
        r."createdAt"
      FROM "Reservations" r
      INNER JOIN "OrderDetails" od ON r."id_orderDetail" = od."id_orderDetail"
      WHERE (od.amount - COALESCE(r."totalPaid", 0)) = 0 
      AND r.status != 'Completada'
      AND r."deletedAt" IS NULL
      LIMIT 5;
    `);

    console.table(sampleReservations);

    // Solicitamos confirmación (en producción podrías comentar esto)
    console.log('\n⚠️  ¿Deseas continuar con la actualización?');
    console.log('   Presiona Ctrl+C para cancelar o espera 5 segundos para continuar...\n');
    
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Realizamos la actualización
    console.log('🔄 Actualizando reservas...');
    const [updateResult] = await sequelize.query(`
      UPDATE "Reservations" r
      SET 
        status = 'Completada',
        "updatedAt" = NOW()
      FROM "OrderDetails" od
      WHERE r."id_orderDetail" = od."id_orderDetail"
      AND (od.amount - COALESCE(r."totalPaid", 0)) = 0 
      AND r.status != 'Completada'
      AND r."deletedAt" IS NULL;
    `);

    console.log(`\n✅ Actualización completada exitosamente!`);
    console.log(`📊 Total de reservas actualizadas: ${totalToUpdate}`);

    // Verificamos el resultado
    console.log('\n📊 Verificando actualización...');
    const [verifyResult] = await sequelize.query(`
      SELECT COUNT(*) as total
      FROM "Reservations" r
      INNER JOIN "OrderDetails" od ON r."id_orderDetail" = od."id_orderDetail"
      WHERE (od.amount - COALESCE(r."totalPaid", 0)) = 0 
      AND r.status = 'Completada'
      AND r."deletedAt" IS NULL;
    `);

    console.log(`✅ Reservas con saldo 0 y estado "Completada": ${verifyResult[0].total}`);

    // Mostrar resumen por estado
    console.log('\n📊 Resumen de estados de reservas:');
    const [statusSummary] = await sequelize.query(`
      SELECT 
        r.status,
        COUNT(*) as cantidad,
        SUM(od.amount - COALESCE(r."totalPaid", 0)) as saldo_total
      FROM "Reservations" r
      INNER JOIN "OrderDetails" od ON r."id_orderDetail" = od."id_orderDetail"
      WHERE r."deletedAt" IS NULL
      GROUP BY r.status
      ORDER BY r.status;
    `);

    console.table(statusSummary);

  } catch (error) {
    console.error('❌ Error durante la actualización:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
    console.log('\n🔒 Conexión cerrada');
  }
}

// Ejecutar el script
updateCompletedReservations()
  .then(() => {
    console.log('\n✅ Script finalizado correctamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  });
