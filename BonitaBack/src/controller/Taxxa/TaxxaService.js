const { SellerData, User, Invoice, CreditNote } = require('../../data');
const { TaxxaService } = require('colombian-invoice-library');

// Crear una instancia de la librería
const colombianInvoice = new TaxxaService({
    apiKey: process.env.TAXXA_API_KEY, // Ajusta según tus credenciales
    environment: 'test', // Cambia a 'production' cuando esté listo
  });

const sendToLibrary = async (req, res) => {
  try {
    const { invoiceId, type } = req.body;

    // Obtener los datos del documento (factura o nota de crédito)
    const documentData =
      type === 'invoice'
        ? await Invoice.findByPk(invoiceId)
        : await CreditNote.findByPk(invoiceId);

    if (!documentData) {
      return res.status(404).json({ message: `${type} no encontrado` });
    }

    // Obtener los datos del vendedor y comprador asociados
    const sellerData = await SellerData.findOne({ where: { id: documentData.sdocno } });
    const user = await User.findOne({ where: { id: documentData.n_document } });

    if (!sellerData || !user) {
      return res.status(404).json({ message: 'Datos del vendedor o comprador no encontrados' });
    }

    // Armar el cuerpo para enviar a la librería
    const libraryRequestBody = {
      jSeller: {
        ...sellerData.toJSON(),
      },
      jBuyer: {
        ...user.toJSON(),
      },
      jDocument: {
        ...documentData.toJSON(),
      },
    };

    console.log('Cuerpo armado para librería:', libraryRequestBody);

    // Enviar los datos a través de la librería
    const response = await colombianInvoice.sendInvoice(libraryRequestBody);

    res.status(200).json({ message: 'Enviado exitosamente', data: response });
  } catch (error) {
    console.error('Error al enviar a través de la librería:', error.message);
    res.status(500).json({ message: 'Error al enviar', error: error.message });
  }
};

module.exports = {
  sendToLibrary,
};
