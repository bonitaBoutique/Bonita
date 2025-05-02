const { Receipt, User } = require("../../data"); // Asegúrate de importar User

module.exports = async (req, res) => {
    const { n_document, buyer_email } = req.query;
    console.log("Received query params:", { n_document, buyer_email }); // Log 1: Parámetros recibidos

    if (!n_document && !buyer_email) {
      console.log("Validation failed: n_document and buyer_email are missing."); // Log 2: Falla validación inicial
      return res.status(400).json({ message: "Debe enviar n_document o buyer_email" });
    }

    try {
      let targetEmail = buyer_email;
      let client = null; // Para guardar el cliente encontrado

      // Si se proporciona n_document, busca el email del cliente
      if (n_document && !targetEmail) {
        console.log(`Searching for client with n_document: ${n_document}`); // Log 3: Buscando cliente por documento
        client = await User.findOne({ where: { n_document } });
        console.log("Result from User.findOne:", client ? client.toJSON() : null); // Log 4: Resultado de la búsqueda de cliente

        if (!client) {
          console.log(`Client not found with n_document: ${n_document}. Returning 404.`); // Log 5: Cliente no encontrado
          return res.status(404).json({ message: "Cliente no encontrado con ese documento" });
        }
        targetEmail = client.email; // Usa el email encontrado
        console.log(`Found client email: ${targetEmail}`); // Log 6: Email encontrado
      }

      if (!targetEmail) {
         console.log("Validation failed: Could not determine targetEmail."); // Log 7: Falla al determinar email
         return res.status(400).json({ message: "No se pudo determinar el email del cliente" });
      }

      console.log(`Searching receipts for buyer_email: ${targetEmail}`); // Log 8: Buscando recibos por email
      // Busca los recibos tipo GiftCard por el email del comprador
      const receipts = await Receipt.findAll({
        where: {
          payMethod: "GiftCard",
          buyer_email: targetEmail // Filtra por el email del comprador
        },
        order: [["date", "DESC"]],
      });
      console.log(`Found ${receipts.length} receipts.`); // Log 9: Número de recibos encontrados

      // Si no se encuentran recibos, podrías considerar devolver 200 con un array vacío o 404 si prefieres
       if (receipts.length === 0) {
         console.log(`No receipts found for buyer_email: ${targetEmail}. Returning 404 or empty array.`);
      return res.status(404).json({ message: "No se encontraron recibos GiftCard para este cliente" });
       }

      return res.status(200).json({ receipts });

    } catch (error) {
      console.error("Error in getGiftCardReceipts:", error); // Log 10: Error general
      return res.status(500).json({ message: "Error al obtener recibos GiftCard" });
    }
  };