/**
 * Script para recalcular paid_amount de todas las facturas
 * basándose en los pagos existentes en la base de datos
 */

const { SupplierInvoice, SupplierPayment, sequelize } = require('../src/data');

async function fixPaidAmounts() {
  try {
    console.log('🔄 Iniciando recalculación de paid_amount...\n');

    // Obtener todas las facturas con sus pagos
    const invoices = await SupplierInvoice.findAll({
      include: [{
        model: SupplierPayment,
        as: 'payments'
      }]
    });

    console.log(`📊 Encontradas ${invoices.length} facturas\n`);

    let updated = 0;
    let unchanged = 0;

    for (const invoice of invoices) {
      // Calcular el total pagado sumando todos los pagos
      const calculatedPaidAmount = invoice.payments.reduce((sum, payment) => {
        return sum + parseFloat(payment.amount || 0);
      }, 0);

      const currentPaidAmount = parseFloat(invoice.paid_amount || 0);

      if (calculatedPaidAmount !== currentPaidAmount) {
        console.log(`🔧 Factura ${invoice.invoice_number}:`);
        console.log(`   - Actual paid_amount: $${currentPaidAmount}`);
        console.log(`   - Calculado (suma pagos): $${calculatedPaidAmount}`);
        console.log(`   - Pagos: ${invoice.payments.length}`);
        
        // Actualizar
        await invoice.update({ paid_amount: calculatedPaidAmount });
        
        console.log(`   ✅ Actualizado\n`);
        updated++;
      } else {
        unchanged++;
      }
    }

    console.log('\n📈 Resumen:');
    console.log(`   ✅ Actualizadas: ${updated}`);
    console.log(`   ⏭️  Sin cambios: ${unchanged}`);
    console.log(`   📊 Total: ${invoices.length}\n`);

    console.log('✅ Proceso completado exitosamente');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Ejecutar
fixPaidAmounts();
