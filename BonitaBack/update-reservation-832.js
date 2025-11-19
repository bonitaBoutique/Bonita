/**
 * Script para actualizar el método de pago de la reserva #832
 */

const { Reservation } = require('./src/data');

async function updateReservationPaymentMethod() {
  try {
    console.log('🔍 Buscando reserva para orden 6a768ee1-c929-4dae-a8cd-df7daa3847e2...');
    
    const reservation = await Reservation.findOne({
      where: { id_orderDetail: '6a768ee1-c929-4dae-a8cd-df7daa3847e2' }
    });

    if (!reservation) {
      console.log('❌ Reserva no encontrada');
      process.exit(1);
      return;
    }

    console.log('✅ Reserva encontrada:', {
      id: reservation.id_reservation,
      partialPayment: reservation.partialPayment,
      paymentMethod: reservation.paymentMethod,
      createdAt: reservation.createdAt
    });

    console.log('🔄 Actualizando método de pago a "Bancolombia"...');
    
    await reservation.update({
      paymentMethod: 'Bancolombia'
    });

    console.log('✅ Método de pago actualizado');
    console.log('Reserva actualizada:', {
      id: reservation.id_reservation,
      partialPayment: reservation.partialPayment,
      paymentMethod: reservation.paymentMethod
    });

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateReservationPaymentMethod();
