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
    // Obtener la última factura ordenada por número
    const lastInvoice = await Invoice.findOne({
      order: [['createdAt', 'DESC']] // Ordenar por fecha de creación en lugar de número
    });

    // Si no hay facturas, comenzar desde 2
    if (!lastInvoice) {
      return response(res, 200, { 
        success: true,
        nextInvoiceNumber: "2" // Primer número como string
      });
    }

    // Si hay factura previa, convertir a número y sumar 1
    const currentNumber = parseInt(lastInvoice.invoiceNumber || "1");
    const nextNumber = (currentNumber + 1).toString(); // Convertir de vuelta a string

    return response(res, 200, { 
      success: true,
      nextInvoiceNumber: nextNumber
    });

  } catch (error) {
    console.error('Error al obtener último número de factura:', error);
    return response(res, 500, {
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  postInvoice,
  getInvoicesByStatus, 
  getLastInvoiceNumber
};