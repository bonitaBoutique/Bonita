/**
 * Script para buscar el pago del recibo #832
 * Orden: 6a768ee1-c929-4dae-a8cd-df7daa3847e2
 * Cliente: maria1087111090@example.com
 * Monto: $50,000
 * Fecha: 19/11/2025
 */

const { OrderDetail, Receipt, CreditPayment, Reservation, User } = require('./src/data');
const { Op } = require('sequelize');

async function searchPayment832() {
  try {
    console.log('🔍 Iniciando búsqueda del pago #832...\n');
    
    const orderId = '6a768ee1-c929-4dae-a8cd-df7daa3847e2';
    const receiptNumber = 832;
    const paymentAmount = 50000;
    const clientEmail = 'maria1087111090@example.com';
    const paymentDate = '2025-11-19';
    
    // 1. Buscar la orden por ID
    console.log('📦 1. Buscando orden por ID:', orderId);
    const order = await OrderDetail.findOne({
      where: { id_orderDetail: orderId },
      include: [
        { 
          model: User,
          attributes: ['n_document', 'first_name', 'last_name', 'email', 'phone']
        },
        {
          model: Reservation,
          include: [{
            model: CreditPayment
          }]
        }
      ]
    });
    
    if (order) {
      console.log('✅ Orden encontrada:');
      console.log(JSON.stringify(order.toJSON(), null, 2));
      console.log('\n');
    } else {
      console.log('❌ Orden NO encontrada\n');
    }
    
    // 2. Buscar recibo por número
    console.log('🧾 2. Buscando recibo #832...');
    const receipt = await Receipt.findOne({
      where: { id_receipt: receiptNumber }
    });
    
    if (receipt) {
      console.log('✅ Recibo encontrado:');
      console.log(JSON.stringify(receipt.toJSON(), null, 2));
      console.log('\n');
    } else {
      console.log('❌ Recibo #832 NO encontrado en la base de datos\n');
    }
    
    // 3. Buscar recibos del cliente por email
    console.log('📧 3. Buscando recibos del cliente por email:', clientEmail);
    const clientReceipts = await Receipt.findAll({
      where: { buyer_email: clientEmail },
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    
    if (clientReceipts.length > 0) {
      console.log(`✅ Encontrados ${clientReceipts.length} recibos del cliente:`);
      clientReceipts.forEach(r => {
        console.log(`  - Recibo #${r.id_receipt}: $${r.total_amount} - ${r.payMethod} - ${r.createdAt}`);
      });
      console.log('\n');
    } else {
      console.log('❌ No se encontraron recibos del cliente\n');
    }
    
    // 4. Buscar pagos de crédito por monto y fecha cercana
    console.log('💳 4. Buscando pagos de crédito cercanos a $50,000 el 19/11/2025...');
    const creditPayments = await CreditPayment.findAll({
      where: {
        amount: {
          [Op.between]: [49000, 51000] // Rango de ±1000
        },
        date: {
          [Op.between]: [
            new Date('2025-11-18'),
            new Date('2025-11-20')
          ]
        }
      },
      include: [{
        model: Reservation,
        include: [{
          model: OrderDetail
        }]
      }]
    });
    
    if (creditPayments.length > 0) {
      console.log(`✅ Encontrados ${creditPayments.length} pagos de crédito:`);
      creditPayments.forEach(p => {
        console.log(`  - Pago ID: ${p.id_payment}`);
        console.log(`    Monto: $${p.amount}`);
        console.log(`    Fecha: ${p.date}`);
        console.log(`    Reserva: ${p.id_reservation}`);
        if (p.Reservation?.OrderDetail) {
          console.log(`    Orden: ${p.Reservation.OrderDetail.id_orderDetail}`);
        }
        console.log('');
      });
    } else {
      console.log('❌ No se encontraron pagos de crédito en ese rango\n');
    }
    
    // 5. Buscar recibos por monto similar y fecha
    console.log('💰 5. Buscando recibos por monto ~$50,000 el 19/11/2025...');
    const amountReceipts = await Receipt.findAll({
      where: {
        total_amount: {
          [Op.between]: [49000, 51000]
        },
        createdAt: {
          [Op.between]: [
            new Date('2025-11-18'),
            new Date('2025-11-20')
          ]
        }
      },
      order: [['createdAt', 'DESC']]
    });
    
    if (amountReceipts.length > 0) {
      console.log(`✅ Encontrados ${amountReceipts.length} recibos:`);
      amountReceipts.forEach(r => {
        console.log(`  - Recibo #${r.id_receipt}`);
        console.log(`    Monto: $${r.total_amount}`);
        console.log(`    Cliente: ${r.buyer_name} (${r.buyer_email})`);
        console.log(`    Método: ${r.payMethod}`);
        console.log(`    Fecha: ${r.createdAt}`);
        console.log('');
      });
    } else {
      console.log('❌ No se encontraron recibos con ese monto\n');
    }
    
    // 6. Buscar todas las reservas relacionadas con la orden
    if (order && order.Reservations && order.Reservations.length > 0) {
      console.log('📋 6. Información de la reserva:');
      console.log(JSON.stringify(order.Reservations, null, 2));
    }
    
    console.log('\n=== RESUMEN ===');
    console.log('Datos del recibo PDF:');
    console.log(`  - Recibo #${receiptNumber}`);
    console.log(`  - Orden: ${orderId}`);
    console.log(`  - Cliente: ${clientEmail}`);
    console.log(`  - Monto: $${paymentAmount.toLocaleString('es-CO')}`);
    console.log(`  - Fecha: ${paymentDate}`);
    console.log(`  - Tipo: Pago Parcial Reserva`);
    console.log('\nResultados:');
    console.log(`  - Orden encontrada: ${order ? '✅ SÍ' : '❌ NO'}`);
    console.log(`  - Recibo encontrado: ${receipt ? '✅ SÍ' : '❌ NO'}`);
    console.log(`  - Pagos de crédito encontrados: ${creditPayments.length}`);
    console.log(`  - Recibos similares encontrados: ${amountReceipts.length}`);
    
  } catch (error) {
    console.error('❌ Error en la búsqueda:', error);
  } finally {
    process.exit(0);
  }
}

searchPayment832();
