const { SupplierPayment, SupplierInvoice, Supplier } = require("../../data");
const { Op } = require("sequelize");
const response = require("../../utils/response");

module.exports = async (req, res) => {
  try {
    const { 
      id_supplier, 
      id_invoice,
      payment_method,
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

    // Filtro por factura
    if (id_invoice) {
      where.id_invoice = id_invoice;
    }

    // Filtro por método de pago
    if (payment_method) {
      where.payment_method = payment_method;
    }

    // Filtro por rango de fechas
    if (from_date || to_date) {
      where.payment_date = {};
      if (from_date) {
        where.payment_date[Op.gte] = new Date(from_date);
      }
      if (to_date) {
        where.payment_date[Op.lte] = new Date(to_date);
      }
    }

    const { count, rows } = await SupplierPayment.findAndCountAll({
      where,
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'business_name', 'document_number']
        },
        {
          model: SupplierInvoice,
          as: 'invoice',
          attributes: ['id', 'invoice_number', 'total_amount', 'paid_amount', 'status']
        }
      ],
      order: [['payment_date', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Calcular total de pagos
    const totalPayments = rows.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);

    console.log(`✅ [GET PAYMENTS] ${rows.length} pagos obtenidos`);

    response(res, 200, {
      payments: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      },
      summary: {
        totalPayments
      }
    });
  } catch (error) {
    console.error("❌ [GET PAYMENTS] Error:", error);
    response(res, 500, { error: error.message });
  }
};
