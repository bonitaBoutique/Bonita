const { SupplierInvoice, SupplierPayment } = require("../../data");
const response = require("../../utils/response");
const cloudinary = require('cloudinary').v2;

module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      invoice_number,
      invoice_date,
      due_date,
      total_amount,
      tax_amount,
      currency,
      description,
      invoice_url,
      invoice_public_id,
      status
    } = req.body;

    const invoice = await SupplierInvoice.findByPk(id);

    if (!invoice) {
      return response(res, 404, { error: "Factura no encontrada" });
    }

    // Si se está cambiando la factura, eliminar la anterior de Cloudinary
    if (invoice_public_id && invoice.invoice_public_id && invoice_public_id !== invoice.invoice_public_id) {
      try {
        await cloudinary.uploader.destroy(invoice.invoice_public_id);
        console.log(`🗑️ [UPDATE INVOICE] Factura anterior eliminada de Cloudinary: ${invoice.invoice_public_id}`);
      } catch (cloudinaryError) {
        console.error("⚠️ [UPDATE INVOICE] Error eliminando factura de Cloudinary:", cloudinaryError);
      }
    }

    // Si se cambia el total_amount, necesitamos recalcular el estado
    const updatedData = {
      invoice_number: invoice_number || invoice.invoice_number,
      invoice_date: invoice_date || invoice.invoice_date,
      due_date,
      total_amount: total_amount !== undefined ? total_amount : invoice.total_amount,
      tax_amount,
      currency: currency || invoice.currency,
      description,
      invoice_url,
      invoice_public_id,
      status
    };

    await invoice.update(updatedData);

    // Recargar con pagos para obtener el estado actualizado
    const updatedInvoice = await SupplierInvoice.findByPk(id, {
      include: [
        {
          model: SupplierPayment,
          as: 'payments'
        }
      ]
    });

    console.log(`✅ [UPDATE INVOICE] Factura actualizada: ${updatedInvoice.invoice_number} (ID: ${id})`);

    response(res, 200, {
      message: "Factura actualizada exitosamente",
      invoice: updatedInvoice
    });
  } catch (error) {
    console.error("❌ [UPDATE INVOICE] Error:", error);
    response(res, 500, { error: error.message });
  }
};
