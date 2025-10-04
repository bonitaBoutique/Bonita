const { SupplierPayment, SupplierInvoice, Supplier } = require("../../data");
const response = require("../../utils/response");

module.exports = async (req, res) => {
  try {
    const {
      id_invoice,
      id_supplier,
      payment_date,
      amount,
      payment_method,
      reference_number,
      receipt_url,
      receipt_public_id,
      notes,
      created_by
    } = req.body;

    // Validaciones
    if (!id_invoice || !id_supplier || !payment_date || !amount) {
      return response(res, 400, { 
        error: "Factura, proveedor, fecha y monto son requeridos" 
      });
    }

    if (amount <= 0) {
      return response(res, 400, { error: "El monto debe ser mayor a cero" });
    }

    // Verificar que la factura existe
    const invoice = await SupplierInvoice.findByPk(id_invoice);
    if (!invoice) {
      return response(res, 404, { error: "Factura no encontrada" });
    }

    // Verificar que el proveedor existe
    const supplier = await Supplier.findByPk(id_supplier);
    if (!supplier) {
      return response(res, 404, { error: "Proveedor no encontrado" });
    }

    // Verificar que no se exceda el saldo pendiente
    const currentBalance = invoice.total_amount - (invoice.paid_amount || 0);
    if (amount > currentBalance) {
      return response(res, 400, { 
        error: `El monto del pago (${amount}) excede el saldo pendiente (${currentBalance})` 
      });
    }

    // Crear el pago
    const newPayment = await SupplierPayment.create({
      id_invoice,
      id_supplier,
      payment_date,
      amount,
      payment_method,
      reference_number,
      receipt_url,
      receipt_public_id,
      notes,
      created_by
    });

    // Actualizar paid_amount de la factura
    const newPaidAmount = (invoice.paid_amount || 0) + parseFloat(amount);
    await invoice.update({ paid_amount: newPaidAmount });

    // Recargar la factura para obtener el estado actualizado
    const updatedInvoice = await SupplierInvoice.findByPk(id_invoice);

    // Incluir datos relacionados en la respuesta
    const paymentWithDetails = await SupplierPayment.findByPk(newPayment.id, {
      include: [
        {
          model: SupplierInvoice,
          as: 'invoice',
          attributes: ['id', 'invoice_number', 'total_amount', 'paid_amount', 'status']
        },
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'business_name', 'document_number']
        }
      ]
    });

    console.log(`✅ [CREATE PAYMENT] Pago creado: $${amount} para factura ${invoice.invoice_number} - Nuevo estado: ${updatedInvoice.status}`);

    response(res, 201, {
      message: "Pago registrado exitosamente",
      payment: paymentWithDetails,
      invoiceStatus: updatedInvoice.status,
      remainingBalance: updatedInvoice.total_amount - updatedInvoice.paid_amount
    });
  } catch (error) {
    console.error("❌ [CREATE PAYMENT] Error:", error);
    response(res, 500, { error: error.message });
  }
};
