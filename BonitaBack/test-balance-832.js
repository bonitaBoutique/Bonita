/**
 * Script para verificar que la reserva aparece en el balance
 * con el método de pago correcto
 */

const axios = require('axios');

async function testBalance() {
  try {
    console.log('🔍 Consultando balance para el 18/11/2025...\n');
    
    const response = await axios.get('http://localhost:3001/api/informes/balance', {
      params: {
        startDate: '2025-11-18',
        endDate: '2025-11-18'
      }
    });

    const data = response.data;

    console.log('📊 RESUMEN DEL BALANCE:');
    console.log(`   Total Income: $${data.totalIncome.toLocaleString('es-CO')}`);
    console.log(`   Total Local Sales: $${data.totalLocalSales.toLocaleString('es-CO')}`);
    console.log(`   Total Expenses: $${data.totalExpenses.toLocaleString('es-CO')}`);
    console.log(`   Balance: $${data.balance.toLocaleString('es-CO')}\n`);

    console.log('💰 DESGLOSE POR MÉTODO DE PAGO:');
    console.log(`   Efectivo: $${data.paymentMethodBreakdown.efectivo.toLocaleString('es-CO')}`);
    console.log(`   Tarjeta: $${data.paymentMethodBreakdown.tarjeta.toLocaleString('es-CO')}`);
    console.log(`   Nequi: $${data.paymentMethodBreakdown.nequi.toLocaleString('es-CO')}`);
    console.log(`   Bancolombia: $${data.paymentMethodBreakdown.bancolombia.toLocaleString('es-CO')}`);
    console.log(`   Pagos Iniciales: $${data.paymentMethodBreakdown.pagosIniciales.toLocaleString('es-CO')}\n`);

    console.log('🔍 BUSCANDO PAGO DE RESERVA #832...');
    const reservationPayment = data.income.local.find(payment => 
      payment.id_orderDetail === '6a768ee1-c929-4dae-a8cd-df7daa3847e2' &&
      payment.type === 'Pago Inicial Reserva'
    );

    if (reservationPayment) {
      console.log('✅ PAGO DE RESERVA ENCONTRADO:');
      console.log(`   ID: ${reservationPayment.id}`);
      console.log(`   Monto: $${reservationPayment.amount.toLocaleString('es-CO')}`);
      console.log(`   Método de Pago: ${reservationPayment.paymentMethod}`);
      console.log(`   Cliente: ${reservationPayment.buyerName}`);
      console.log(`   Email: ${reservationPayment.buyerEmail}`);
      console.log(`   Fecha: ${reservationPayment.date}`);
    } else {
      console.log('❌ NO SE ENCONTRÓ EL PAGO DE RESERVA #832');
      console.log(`\n📋 Total de pagos locales: ${data.income.local.length}`);
      console.log('Pagos de reserva disponibles:');
      data.income.local
        .filter(p => p.type === 'Pago Inicial Reserva')
        .forEach(p => {
          console.log(`   - ${p.buyerName}: $${p.amount} - ${p.paymentMethod} - ${p.date}`);
        });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testBalance();
