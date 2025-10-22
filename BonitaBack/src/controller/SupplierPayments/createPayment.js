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
    const newPaidAmount = parseFloat((invoice.paid_amount || 0)) + parseFloat(amount);
    console.log(`💰 [CREATE PAYMENT] ANTES del update - Factura ${invoice.invoice_number}:`, {
      id_invoice: invoice.id_invoice,
      monto_anterior_pagado: invoice.paid_amount,
      tipo_monto_anterior: typeof invoice.paid_amount,
      nuevo_pago: amount,
      tipo_nuevo_pago: typeof amount,
      nuevo_monto_pagado: newPaidAmount,
      tipo_nuevo_monto: typeof newPaidAmount,
      total_factura: invoice.total_amount
    });
    
    const updateResult = await invoice.update({ paid_amount: newPaidAmount });
    console.log(`✏️ [CREATE PAYMENT] Resultado del update:`, {
      paid_amount_actualizado: updateResult.paid_amount,
      tipo: typeof updateResult.paid_amount
    });

    // Recargar la factura para obtener el estado actualizado
    const updatedInvoice = await SupplierInvoice.findByPk(id_invoice, { raw: true });
    console.log(`📊 [CREATE PAYMENT] DESPUÉS de recargar - Factura actualizada:`, {
      invoice_number: updatedInvoice.invoice_number,
      total: updatedInvoice.total_amount,
      paid: updatedInvoice.paid_amount,
      tipo_paid: typeof updatedInvoice.paid_amount,
      balance: parseFloat(updatedInvoice.total_amount) - parseFloat(updatedInvoice.paid_amount),
      status: updatedInvoice.status
    });

    // Incluir datos relacionados en la respuesta
    const paymentWithDetails = await SupplierPayment.findByPk(newPayment.id_payment, {
      include: [
        {
          model: SupplierInvoice,
          as: 'invoice',
          attributes: ['id_invoice', 'invoice_number', 'total_amount', 'paid_amount', 'status']
        },
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id_supplier', 'business_name', 'document_number']
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
