const { Invoice } = require('../data'); // Importa el modelo Invoice



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
    console.log('📊 Consultando última factura...');
    
    // Obtener la última factura ordenada por fecha de creación (más reciente primero)
    const lastInvoice = await Invoice.findOne({
      order: [['createdAt', 'DESC']], // ✅ Ordenar por fecha de creación en lugar de string
      attributes: ['invoiceNumber', 'createdAt'] // Incluir createdAt para debug
    });

    console.log('📄 Última factura encontrada:', lastInvoice?.invoiceNumber, 'creada el:', lastInvoice?.createdAt);

    // Si no hay facturas, comenzar desde 5
    if (!lastInvoice) {
      console.log('⚠️ No hay facturas previas, iniciando desde 5');
      return res.status(200).json({ 
        success: true,
        nextInvoiceNumber: "5"
      });
    }

    // Extraer el número de la factura eliminando el prefijo (FVB105 -> 105)
    const currentNumber = parseInt(lastInvoice.invoiceNumber.replace(/^\D+/g, '') || "2");
    const nextNumber = (currentNumber + 1).toString();

    console.log('✅ Número actual:', currentNumber, '→ Próximo número:', nextNumber);

    return res.status(200).json({ 
      success: true,
      nextInvoiceNumber: nextNumber
    });

  } catch (error) {
    console.error('❌ Error al obtener último número de factura:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener último número de factura',
      error: error.message
    });
  }
};

const getAllInvoices = async (req, res) => {
  try {
    // Recuperar todas las facturas de la base de datos
    const invoices = await Invoice.findAll();

    return res.status(200).json({
      success: true,
      message: 'Facturas recuperadas con éxito',
      invoices,
    });
  } catch (error) {
    console.error('Error al recuperar las facturas:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al recuperar las facturas',
      error: error.message,
    });
  }
};

module.exports = {
  
  getInvoicesByStatus, 
  getLastInvoiceNumber,
  getAllInvoices,
};