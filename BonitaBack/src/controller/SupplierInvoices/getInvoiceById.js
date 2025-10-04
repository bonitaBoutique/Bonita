const { SupplierInvoice, Supplier, SupplierPayment } = require("../../data");
const response = require("../../utils/response");

module.exports = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await SupplierInvoice.findByPk(id, {
      include: [
        {
          model: Supplier,
          as: 'supplier'
        },
        {
          model: SupplierPayment,
          as: 'payments',
          order: [['payment_date', 'DESC']]
        }
      ]
    });

    if (!invoice) {
      return response(res, 404, { error: "Factura no encontrada" });
    }

    console.log(`✅ [GET INVOICE BY ID] Factura obtenida: ${invoice.invoice_number}`);

    response(res, 200, { invoice });
  } catch (error) {
    console.error("❌ [GET INVOICE BY ID] Error:", error);
    response(res, 500, { error: error.message });
  }
};
