const { SupplierInvoice, Supplier } = require("../../data");
const { Op } = require("sequelize");
const response = require("../../utils/response");

module.exports = async (req, res) => {
  try {
    const { id_supplier } = req.query;

    const where = {
      status: {
        [Op.in]: ['pending', 'partial', 'overdue']
      }
    };

    // Filtro por proveedor si se especifica
    if (id_supplier) {
      where.id_supplier = id_supplier;
    }

    const pendingInvoices = await SupplierInvoice.findAll({
      where,
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id_supplier', 'business_name', 'document_number']
        }
      ],
      order: [
        ['due_date', 'ASC'],
        ['invoice_date', 'DESC']
      ]
    });

    // Calcular saldo total pendiente
    const totalPending = pendingInvoices.reduce((sum, invoice) => {
      const balance = invoice.total_amount - (invoice.paid_amount || 0);
      return sum + balance;
    }, 0);

    // Agrupar por proveedor
    const bySupplier = {};
    pendingInvoices.forEach(invoice => {
      const supplierId = invoice.id_supplier;
      if (!bySupplier[supplierId]) {
        bySupplier[supplierId] = {
          supplier: invoice.supplier,
          invoices: [],
          totalPending: 0
        };
      }
      const balance = invoice.total_amount - (invoice.paid_amount || 0);
      bySupplier[supplierId].invoices.push(invoice);
      bySupplier[supplierId].totalPending += balance;
    });

    console.log(`✅ [GET PENDING PAYMENTS] ${pendingInvoices.length} facturas pendientes encontradas`);

    response(res, 200, {
      pendingInvoices,
      bySupplier: Object.values(bySupplier),
      summary: {
        totalInvoices: pendingInvoices.length,
        totalPending
      }
    });
  } catch (error) {
    console.error("❌ [GET PENDING PAYMENTS] Error:", error);
    response(res, 500, { error: error.message });
  }
};
