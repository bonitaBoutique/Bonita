const { Invoice } = require('../data'); // Importa el modelo Invoice

const postInvoice = async (req, res) => {
  try {
    const { buyerId, sellerId, invoiceNumber, totalAmount, taxxaResponse, taxxaId } = req.body;

    // Crea la factura en la base de datos
    const invoice = await Invoice.create({
      buyerId,
      sellerId,
      invoiceNumber,
      totalAmount,
      taxxaResponse,
      taxxaId,
    });

    res.status(201).json({ message: 'Factura creada con éxito', invoice });
  } catch (error) {
    console.error('Error al crear la factura:', error);
    res.status(500).json({ message: 'Error al crear la factura', error: error.message });
  }
};

const getInvoicesByStatus = async (req, res) => {
  try {
    const { status } = req.params; // Obtiene el estado desde los parámetros de la ruta

    // Busca las facturas en la base de datos que coincidan con el estado
    const invoices = await Invoice.findAll({
      where: {
        status: status, // Usa el estado proporcionado en la petición
      },
    });

    res.status(200).json({ message: 'Facturas encontradas con éxito', invoices });
  } catch (error) {
    console.error('Error al obtener las facturas:', error);
    res.status(500).json({ message: 'Error al obtener las facturas', error: error.message });
  }
};

const getLastInvoiceNumber = async (req, res) => {
  try {
    const lastInvoice = await Invoice.findOne({
      order: [['createdAt', 'DESC']],
    });

    // If no invoice exists, start with "2"
    const nextNumber = lastInvoice 
      ? (parseInt(lastInvoice.invoiceNumber) + 1).toString()
      : "2";

    return response(res, 200, { nextInvoiceNumber: nextNumber });
  } catch (error) {
    console.error('Error getting last invoice number:', error);
    return response(res, 500, { error: error.message });
  }
};

module.exports = {
  postInvoice,
  getInvoicesByStatus, 
  getLastInvoiceNumber
};