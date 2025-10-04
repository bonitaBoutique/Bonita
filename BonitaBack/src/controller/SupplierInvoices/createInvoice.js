const { SupplierInvoice, Supplier } = require("../../data");
const response = require("../../utils/response");
const cloudinary = require('cloudinary').v2;

module.exports = async (req, res) => {
  try {
    const {
      id_supplier,
      invoice_number,
      invoice_date,
      due_date,
      total_amount,
      tax_amount = 0,
      currency = 'COP',
      description,
      receipt_url,
      receipt_public_id,
      status = 'pending'
    } = req.body;

    // Validaciones
    if (!id_supplier || !invoice_number || !invoice_date || !total_amount) {
      return response(res, 400, { 
        error: "Proveedor, número de factura, fecha y monto total son requeridos" 
      });
    }

    // Verificar que el proveedor existe
    const supplier = await Supplier.findByPk(id_supplier);
    if (!supplier) {
      return response(res, 404, { error: "Proveedor no encontrado" });
    }

    // Verificar si ya existe una factura con ese número para este proveedor
    const existingInvoice = await SupplierInvoice.findOne({
      where: { 
        id_supplier, 
        invoice_number 
      }
    });

    if (existingInvoice) {
      return response(res, 400, { 
        error: `Ya existe una factura con el número ${invoice_number} para este proveedor` 
      });
    }

    const newInvoice = await SupplierInvoice.create({
      id_supplier,
      invoice_number,
      invoice_date,
      due_date,
      total_amount,
      paid_amount: 0,
      tax_amount,
      currency,
      description,
      receipt_url,
      receipt_public_id,
      status
    });

    // Incluir datos del proveedor en la respuesta
    const invoiceWithSupplier = await SupplierInvoice.findByPk(newInvoice.id, {
      include: [
        {
          model: Supplier,
          as: 'supplier'
        }
      ]
    });

    console.log(`✅ [CREATE INVOICE] Factura creada: ${invoice_number} para ${supplier.business_name}`);

    response(res, 201, {
      message: "Factura creada exitosamente",
      invoice: invoiceWithSupplier
    });
  } catch (error) {
    console.error("❌ [CREATE INVOICE] Error:", error);
    response(res, 500, { error: error.message });
  }
};
