const { Supplier } = require("../../data");
const response = require("../../utils/response");

module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      business_name,
      document_type,
      document_number,
      contact_name,
      email,
      phone,
      address,
      city,
      country,
      category,
      payment_terms,
      bank_name,
      bank_account,
      notes,
      status
    } = req.body;

    const supplier = await Supplier.findByPk(id);

    if (!supplier) {
      return response(res, 404, { error: "Proveedor no encontrado" });
    }

    // Si se está cambiando el documento, verificar que no exista otro con ese número
    if (document_number && document_number !== supplier.document_number) {
      const existingSupplier = await Supplier.findOne({
        where: { document_number }
      });

      if (existingSupplier) {
        return response(res, 400, { error: `Ya existe otro proveedor con el documento ${document_number}` });
      }
    }

    await supplier.update({
      business_name: business_name || supplier.business_name,
      document_type: document_type || supplier.document_type,
      document_number: document_number || supplier.document_number,
      contact_name,
      email,
      phone,
      address,
      city,
      country,
      category,
      payment_terms,
      bank_name,
      bank_account,
      notes,
      status: status || supplier.status
    });

    console.log(`✅ [UPDATE SUPPLIER] Proveedor actualizado: ${supplier.business_name} (ID: ${id})`);

    response(res, 200, {
      message: "Proveedor actualizado exitosamente",
      supplier
    });
  } catch (error) {
    console.error("❌ [UPDATE SUPPLIER] Error:", error);
    response(res, 500, { error: error.message });
  }
};
