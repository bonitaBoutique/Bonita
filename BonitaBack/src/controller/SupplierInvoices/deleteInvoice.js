const { SupplierInvoice, SupplierPayment } = require("../../data");
const response = require("../../utils/response");
const cloudinary = require('cloudinary').v2;

module.exports = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await SupplierInvoice.findByPk(id);

    if (!invoice) {
      return response(res, 404, { error: "Factura no encontrada" });
    }

    // Eliminar comprobante de Cloudinary si existe
    if (invoice.receipt_public_id) {
      try {
        await cloudinary.uploader.destroy(invoice.receipt_public_id);
        console.log(`🗑️ [DELETE INVOICE] Comprobante eliminado de Cloudinary: ${invoice.receipt_public_id}`);
      } catch (cloudinaryError) {
        console.error("⚠️ [DELETE INVOICE] Error eliminando comprobante:", cloudinaryError);
      }
    }

    // Eliminar pagos asociados y sus comprobantes
    const payments = await SupplierPayment.findAll({ where: { id_invoice: id } });
    for (const payment of payments) {
      if (payment.receipt_public_id) {
        try {
          await cloudinary.uploader.destroy(payment.receipt_public_id);
          console.log(`🗑️ [DELETE INVOICE] Comprobante de pago eliminado: ${payment.receipt_public_id}`);
        } catch (cloudinaryError) {
          console.error("⚠️ [DELETE INVOICE] Error eliminando comprobante de pago:", cloudinaryError);
        }
      }
    }

    // Soft delete (paranoid: true) - también eliminará los pagos por CASCADE
    await invoice.destroy();

    console.log(`✅ [DELETE INVOICE] Factura eliminada: ${invoice.invoice_number} (ID: ${id})`);

    response(res, 200, {
      message: "Factura y pagos asociados eliminados exitosamente"
    });
  } catch (error) {
    console.error("❌ [DELETE INVOICE] Error:", error);
    response(res, 500, { error: error.message });
  }
};
