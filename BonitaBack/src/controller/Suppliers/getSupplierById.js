const { Supplier, SupplierInvoice, SupplierPayment } = require("../../data");
const response = require("../../utils/response");

module.exports = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que el ID sea válido
    if (!id || id === 'undefined' || id === 'null') {
      return response(res, 400, { error: "ID de proveedor inválido" });
    }

    const supplier = await Supplier.findByPk(id, {
      include: [
        {
          model: SupplierInvoice,
          as: 'invoices',
          include: [
            {
              model: SupplierPayment,
              as: 'payments'
            }
          ]
        },
        {
          model: SupplierPayment,
          as: 'payments'
        }
      ]
    });

    if (!supplier) {
      return response(res, 404, { error: "Proveedor no encontrado" });
    }

    // Calcular deuda total
    const totalDebt = supplier.invoices?.reduce((sum, invoice) => {
      const balance = invoice.total_amount - (invoice.paid_amount || 0);
      return sum + (balance > 0 ? balance : 0);
    }, 0) || 0;

    // Calcular total pagado
    const totalPaid = supplier.invoices?.reduce((sum, invoice) => {
      return sum + (invoice.paid_amount || 0);
    }, 0) || 0;

    // Contar facturas por estado
    const invoiceStats = {
      total: supplier.invoices?.length || 0,
      pending: supplier.invoices?.filter(inv => inv.status === 'pending').length || 0,
      partial: supplier.invoices?.filter(inv => inv.status === 'partial').length || 0,
      paid: supplier.invoices?.filter(inv => inv.status === 'paid').length || 0,
      overdue: supplier.invoices?.filter(inv => inv.status === 'overdue').length || 0,
      cancelled: supplier.invoices?.filter(inv => inv.status === 'cancelled').length || 0
    };

    console.log(`✅ [GET SUPPLIER BY ID] Proveedor obtenido: ${supplier.business_name} (ID: ${id})`);

    response(res, 200, {
      supplier,
      summary: {
        totalDebt,
        totalPaid,
        invoiceStats
      }
    });
  } catch (error) {
    console.error("❌ [GET SUPPLIER BY ID] Error:", error);
    response(res, 500, { error: error.message });
  }
};
