const { Supplier, SupplierInvoice, SupplierPayment } = require("../../data");
const { Op } = require("sequelize");
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
              as: 'payments',
              order: [['payment_date', 'DESC']]
            }
          ]
        },
        {
          model: SupplierPayment,
          as: 'payments',
          order: [['payment_date', 'DESC']]
        }
      ]
    });

    if (!supplier) {
      return response(res, 404, { error: "Proveedor no encontrado" });
    }

    // Cálculos generales
    const totalInvoices = supplier.invoices?.length || 0;
    const totalAmount = supplier.invoices?.reduce((sum, inv) => sum + parseFloat(inv.total_amount), 0) || 0;
    const totalPaid = supplier.invoices?.reduce((sum, inv) => sum + parseFloat(inv.paid_amount || 0), 0) || 0;
    const totalPending = totalAmount - totalPaid;

    // Facturas por estado
    const invoicesByStatus = {
      pending: supplier.invoices?.filter(inv => inv.status === 'pending') || [],
      partial: supplier.invoices?.filter(inv => inv.status === 'partial') || [],
      paid: supplier.invoices?.filter(inv => inv.status === 'paid') || [],
      overdue: supplier.invoices?.filter(inv => inv.status === 'overdue') || [],
      cancelled: supplier.invoices?.filter(inv => inv.status === 'cancelled') || []
    };

    // Deuda por estado
    const debtByStatus = {
      pending: invoicesByStatus.pending.reduce((sum, inv) => sum + (inv.total_amount - (inv.paid_amount || 0)), 0),
      partial: invoicesByStatus.partial.reduce((sum, inv) => sum + (inv.total_amount - (inv.paid_amount || 0)), 0),
      overdue: invoicesByStatus.overdue.reduce((sum, inv) => sum + (inv.total_amount - (inv.paid_amount || 0)), 0)
    };

    // Historial de pagos recientes (últimos 10)
    const recentPayments = supplier.payments?.slice(0, 10) || [];

    // Facturas vencidas
    const overdueInvoices = supplier.invoices?.filter(inv => 
      inv.status === 'overdue' || 
      (inv.due_date && new Date(inv.due_date) < new Date() && inv.status !== 'paid' && inv.status !== 'cancelled')
    ) || [];

    // Próximos vencimientos (próximos 30 días)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const upcomingDue = supplier.invoices?.filter(inv => 
      inv.due_date && 
      new Date(inv.due_date) <= thirtyDaysFromNow && 
      new Date(inv.due_date) >= new Date() &&
      (inv.status === 'pending' || inv.status === 'partial')
    ) || [];

    console.log(`✅ [GET ACCOUNT SUMMARY] Resumen de cuenta obtenido para: ${supplier.business_name}`);

    response(res, 200, {
      supplier: {
        id_supplier: supplier.id_supplier,
        business_name: supplier.business_name,
        document_number: supplier.document_number,
        contact_name: supplier.contact_name,
        email: supplier.email,
        phone: supplier.phone,
        category: supplier.category,
        payment_terms: supplier.payment_terms,
        status: supplier.status
      },
      summary: {
        totalInvoices,
        totalAmount,
        totalPaid,
        totalPending,
        totalDebt: totalPending, // ✅ Alias para el frontend
        invoiceStats: {
          total: totalInvoices,
          pending: invoicesByStatus.pending.length,
          partial: invoicesByStatus.partial.length,
          paid: invoicesByStatus.paid.length,
          overdue: invoicesByStatus.overdue.length,
          cancelled: invoicesByStatus.cancelled.length
        },
        invoiceCount: {
          pending: invoicesByStatus.pending.length,
          partial: invoicesByStatus.partial.length,
          paid: invoicesByStatus.paid.length,
          overdue: invoicesByStatus.overdue.length,
          cancelled: invoicesByStatus.cancelled.length
        },
        debtByStatus
      },
      overdueInvoices: overdueInvoices.map(inv => ({
        id_invoice: inv.id_invoice,
        invoice_number: inv.invoice_number,
        invoice_date: inv.invoice_date,
        due_date: inv.due_date,
        total_amount: inv.total_amount,
        paid_amount: inv.paid_amount,
        balance: inv.total_amount - (inv.paid_amount || 0),
        status: inv.status,
        daysOverdue: Math.floor((new Date() - new Date(inv.due_date)) / (1000 * 60 * 60 * 24))
      })),
      upcomingDue: upcomingDue.map(inv => ({
        id_invoice: inv.id_invoice,
        invoice_number: inv.invoice_number,
        invoice_date: inv.invoice_date,
        due_date: inv.due_date,
        total_amount: inv.total_amount,
        paid_amount: inv.paid_amount,
        balance: inv.total_amount - (inv.paid_amount || 0),
        status: inv.status,
        daysUntilDue: Math.floor((new Date(inv.due_date) - new Date()) / (1000 * 60 * 60 * 24))
      })),
      recentPayments: recentPayments.map(pay => ({
        id_payment: pay.id_payment,
        payment_date: pay.payment_date,
        amount: pay.amount,
        payment_method: pay.payment_method,
        reference_number: pay.reference_number,
        id_invoice: pay.id_invoice
      }))
    });
  } catch (error) {
    console.error("❌ [GET ACCOUNT SUMMARY] Error:", error);
    response(res, 500, { error: error.message });
  }
};
