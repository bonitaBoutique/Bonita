const { SupplierInvoice, Supplier, SupplierPayment } = require("../../data");
const { Op } = require("sequelize");
const response = require("../../utils/response");

module.exports = async (req, res) => {
  try {
    const { 
      id_supplier, 
      status, 
      from_date, 
      to_date,
      page = 1, 
      limit = 20 
    } = req.query;

    const offset = (page - 1) * limit;
    
    const where = {};

    // Filtro por proveedor
    if (id_supplier) {
      where.id_supplier = id_supplier;
    }

    // Filtro por estado (puede ser un string con valores separados por coma)
    if (status) {
      // Si contiene comas, dividir en array y usar IN
      if (status.includes(',')) {
        const statusArray = status.split(',').map(s => s.trim());
        where.status = { [Op.in]: statusArray };
      } else {
        where.status = status;
      }
    }

    // Filtro por rango de fechas
    if (from_date || to_date) {
      where.invoice_date = {};
      if (from_date) {
        where.invoice_date[Op.gte] = new Date(from_date);
      }
      if (to_date) {
        where.invoice_date[Op.lte] = new Date(to_date);
      }
    }

    const { count, rows } = await SupplierInvoice.findAndCountAll({
      where,
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id_supplier', 'business_name', 'document_number']
        },
        {
          model: SupplierPayment,
          as: 'payments',
          attributes: ['id_payment', 'payment_date', 'amount', 'payment_method']
        }
      ],
      order: [['invoice_date', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Calcular totales
    const totalAmount = rows.reduce((sum, inv) => sum + parseFloat(inv.total_amount), 0);
    const totalPaid = rows.reduce((sum, inv) => sum + parseFloat(inv.paid_amount || 0), 0);
    const totalPending = totalAmount - totalPaid;

    console.log(`✅ [GET INVOICES] ${rows.length} facturas obtenidas`);

    response(res, 200, {
      invoices: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      },
      summary: {
        totalAmount,
        totalPaid,
        totalPending
      }
    });
  } catch (error) {
    console.error("❌ [GET INVOICES] Error:", error);
    response(res, 500, { error: error.message });
  }
};
