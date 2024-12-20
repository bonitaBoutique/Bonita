const { SellerData, User, Invoice, CreditNote } = require('../../data');
const { TaxxaService } = require('colombian-invoice-library');

// Crear una instancia de la librería
const colombianInvoice = new TaxxaService({
  apiKey: process.env.TAXXA_API_KEY, // Ajusta según tus credenciales
  environment: 'test', // Cambia a 'production' cuando esté listo
});

const createInvoice = async (req, res) => {
  const { id_orderDetail, invoiceData } = req.body;

  try {
    // Validar que el id_orderDetail existe en la petición
    if (!id_orderDetail) {
      return res.status(400).json({ message: "ID de la orden requerido" });
    }

    // Buscar la orden por su ID
    const orderDetail = await OrderDetail.findOne({ where: { id_orderDetail } });

    // Validar que la orden exista
    if (!orderDetail) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    // Validar que la orden no esté ya facturada
    if (orderDetail.status === "facturada") {
      return res.status(400).json({ message: "La orden ya está facturada" });
    }

    // Preparar el objeto para Taxxa
    const taxxaData = {
      sorderreference: id_orderDetail, // Usar el mismo UUID
      ...invoiceData, // Agregar los datos específicos de la factura
    };

    // Aquí iría la lógica para enviar la factura a Taxxa

    // Actualizar el estado de la orden
    await orderDetail.update({ status: "facturada" });

    res.status(201).json({ message: "Factura creada con éxito", taxxaData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear la factura" });
  }
};


const sendToLibrary = async (req, res) => {
  console.log('Datos recibidos en req.body:', req.body);

  try {
    const { jDocument, jBuyerData } = req.body; // Asegúrate de que los datos de jBuyer estén en el cuerpo de la solicitud
    console.log(jDocument);
    const sorderreference = jDocument?.sorderreference;  // Ajusta según la propiedad correcta
    const type = jDocument?.wdocumenttype; // Ajusta según los valores permitidos ('Invoice', 'CreditNote', etc.)

    console.log('Datos procesados:', { sorderreference, type });

    if (!sorderreference || !type) {
      return res.status(400).json({ message: 'Datos insuficientes en la solicitud (sorderreference o type faltan)' });
    }

    const documentData =
      type === 'Invoice'
        ? await Invoice.findByPk(sorderreference)
        : await CreditNote.findByPk(sorderreference);

    if (!documentData) {
      return res.status(404).json({ message: `${type} no encontrado` });
    }

    // Obtener los datos del vendedor
    const sellerData = await SellerData.findOne({ where: { id: documentData.sdocno } });
    if (!sellerData) {
      return res.status(404).json({ message: 'Datos del vendedor no encontrados' });
    }

    // Obtener los datos del comprador
    let user = await User.findOne({ where: { id: jBuyerData?.n_document } });

    if (!user) {
      // Si el comprador no existe, crearlo con los datos proporcionados
      user = await User.create({
        id: jBuyerData?.n_document, // Asegúrate de que el campo `id` sea el NIT o el documento único del comprador
        scostumername: jBuyerData?.scostumername,
        wlegalorganizationtype: jBuyerData?.wlegalorganizationtype,
        sfiscalresponsibilities: jBuyerData?.sfiscalresponsibilities,
        stributaryidentificationkey: jBuyerData?.stributaryidentificationkey,
        stributaryidentificationname: jBuyerData?.stributaryidentificationname,
        sfiscalregime: jBuyerData?.sfiscalregime,
        // Otros campos que sean necesarios
      });
    }

    // Crear el objeto jBuyer con los datos del usuario
    const jBuyer = {
      wlegalorganizationtype: user.wlegalorganizationtype || '', // Si no existe, asignar un valor por defecto
      scostumername: user.scostumername || 'N/A', // Asegúrate de que no esté vacío
      stributaryidentificationkey: user.stributaryidentificationkey || '', 
      stributaryidentificationname: user.stributaryidentificationname || '', 
      sfiscalresponsibilities: user.sfiscalresponsibilities || '', 
      sfiscalregime: user.sfiscalregime || '',
      jpartylegalentity: {
        wdoctype: user.wdoctype || '', // Usar el tipo de documento del usuario
        sdocno: user.id, // ID del usuario
        scorporateregistrationschemename: user.scostumername || '', // Nombre del cliente
      },
      jcontact: {
        scontactperson: user.first_name + ' ' + user.last_name, // Nombre completo del comprador
        selectronicmail: user.email || '', // Email del comprador
        stelephone: user.phone || '', // Teléfono del comprador
      }
    };

    // Estructura de la solicitud para la librería, agregando jSeller
    const libraryRequestBody = {
      jSeller: { ...sellerData.toJSON() }, // Datos del vendedor
      jBuyer: { ...jBuyer }, // Datos del comprador
      jDocument: { ...documentData.toJSON() }, // Datos del documento
    };

    // Añadir console.log antes de enviar la solicitud
    console.log('Datos a enviar a la librería:', libraryRequestBody);

    // Enviar los datos a la librería
    const response = await colombianInvoice.sendInvoice(libraryRequestBody);
    console.log('Respuesta de la librería:', response);

    res.status(200).json({ message: 'Enviado exitosamente', data: response });
  } catch (error) {
    console.error('Error al enviar a través de la librería:', error);
    res.status(500).json({ message: 'Error al enviar', error: error.message });
  }
};



module.exports = {
  sendToLibrary,
  createInvoice
};


