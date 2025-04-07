const { Invoice } = require('../data'); // Importa el modelo Invoice

const postInvoice = async (req, res) => {
  try {
    const { 
      buyerId, 
      sellerId, 
      invoiceNumber, 
      totalAmount, 
      response: taxxaResponse, // From Taxxa API
      orderReference 
    } = req.body;

    // Validate required fields
    if (!buyerId || !sellerId || !invoiceNumber || !totalAmount) {
      return response(res, 400, {
        success: false,
        message: 'Faltan campos requeridos'
      });
    }

    // Extract important fields from Taxxa response
    const taxxaId = taxxaResponse?.jret?.rtaxxadocument;
    const cufe = taxxaResponse?.jret?.scufe;
    const qrCode = taxxaResponse?.jret?.sqr;

    // Create invoice record
    const invoice = await Invoice.create({
      buyerId,
      sellerId,
      invoiceNumber,
      totalAmount: parseFloat(totalAmount),
      taxxaResponse,
      taxxaId,
      status: taxxaResponse?.jret?.yapprovedbytaxoffice === 'Y' ? 'sent' : 'pending',
      orderReference,
      cufe,
      qrCode
    });

    return response(res, 201, {
      success: true,
      message: 'Factura creada con éxito',
      invoice
    });

  } catch (error) {
    console.error('Error al crear la factura:', error);
    return response(res, 500, {
      success: false,
      error: error.message
    });
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
    // Obtener la última factura ordenada por número de factura
    const lastInvoice = await Invoice.findOne({
      order: [['invoiceNumber', 'DESC']], // Ordenar por número de factura
      attributes: ['invoiceNumber'] // Solo necesitamos este campo
    });

    // Si no hay facturas, comenzar desde 5
    if (!lastInvoice) {
      return res.status(200).json({ 
        success: true,
        nextInvoiceNumber: "5"
      });
    }

    // Extraer el número de la factura eliminando el prefijo
    const currentNumber = parseInt(lastInvoice.invoiceNumber.replace(/^\D+/g, '') || "2"); // Eliminar cualquier carácter no numérico
    const nextNumber = (currentNumber + 1).toString();

    return res.status(200).json({ 
      success: true,
      nextInvoiceNumber: nextNumber
    });

  } catch (error) {
    console.error('Error al obtener último número de factura:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener último número de factura',
      error: error.message
    });
  }
};

module.exports = {
  postInvoice,
  getInvoicesByStatus, 
  getLastInvoiceNumber
};