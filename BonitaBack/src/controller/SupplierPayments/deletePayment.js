const { SupplierPayment, SupplierInvoice } = require("../../data");
const response = require("../../utils/response");
const cloudinary = require('cloudinary').v2;

module.exports = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await SupplierPayment.findByPk(id, {
      include: [
        {
          model: SupplierInvoice,
          as: 'invoice'
        }
      ]
    });

    if (!payment) {
      return response(res, 404, { error: "Pago no encontrado" });
    }

    const invoice = payment.invoice;
    const paymentAmount = parseFloat(payment.amount);

    // Eliminar comprobante de Cloudinary si existe
    if (payment.receipt_public_id) {
      try {
        await cloudinary.uploader.destroy(payment.receipt_public_id);
        console.log(`🗑️ [DELETE PAYMENT] Comprobante eliminado de Cloudinary: ${payment.receipt_public_id}`);
      } catch (cloudinaryError) {
        console.error("⚠️ [DELETE PAYMENT] Error eliminando comprobante:", cloudinaryError);
      }
    }

    // Eliminar el pago
    await payment.destroy();

    // Actualizar paid_amount de la factura
    const newPaidAmount = Math.max(0, (invoice.paid_amount || 0) - paymentAmount);
    await invoice.update({ paid_amount: newPaidAmount });

    // Recargar la factura para obtener el estado actualizado
    const updatedInvoice = await SupplierInvoice.findByPk(invoice.id);

    console.log(`✅ [DELETE PAYMENT] Pago eliminado (ID: ${id}) - Factura ${invoice.invoice_number} actualizada a estado: ${updatedInvoice.status}`);

    response(res, 200, {
      message: "Pago eliminado exitosamente",
      invoiceStatus: updatedInvoice.status,
      remainingBalance: updatedInvoice.total_amount - updatedInvoice.paid_amount
    });
  } catch (error) {
    console.error("❌ [DELETE PAYMENT] Error:", error);
    response(res, 500, { error: error.message });
  }
};
