const { Supplier, SupplierInvoice, SupplierPayment } = require("../../data");
const { Op } = require("sequelize");
const response = require("../../utils/response");

module.exports = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status = '', 
      category = '' 
    } = req.query;

    const offset = (page - 1) * limit;

    // Construir condiciones de filtro
    const where = {};

    if (search) {
      where[Op.or] = [
        { business_name: { [Op.iLike]: `%${search}%` } },
        { document_number: { [Op.iLike]: `%${search}%` } },
        { contact_name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = { [Op.iLike]: `%${category}%` };
    }

    const { count, rows: suppliers } = await Supplier.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['business_name', 'ASC']],
      include: [
        {
          model: SupplierInvoice,
          as: 'invoices',
          attributes: ['id_invoice', 'total_amount', 'paid_amount', 'status'],
          required: false
        }
      ]
    });

    // Calcular totales por proveedor
    const suppliersWithTotals = suppliers.map(supplier => {
      const invoices = supplier.invoices || [];
      const totalDebt = invoices.reduce((sum, inv) => {
        return sum + (parseFloat(inv.total_amount) - parseFloat(inv.paid_amount));
      }, 0);

      return {
        ...supplier.toJSON(),
        totalDebt,
        invoiceCount: invoices.length
      };
    });

    response(res, 200, {
      suppliers: suppliersWithTotals,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error("❌ [GET SUPPLIERS] Error:", error);
    response(res, 500, { error: error.message });
  }
};
