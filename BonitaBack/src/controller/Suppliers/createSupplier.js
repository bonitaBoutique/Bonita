const { Supplier } = require("../../data");
const response = require("../../utils/response");

module.exports = async (req, res) => {
  try {
    const {
      business_name,
      document_type,
      document_number,
      contact_name,
      email,
      phone,
      address,
      city,
      country = "Colombia",
      category,
      payment_terms,
      bank_name,
      bank_account,
      notes,
      status = "active"
    } = req.body;

    // Validaciones
    if (!business_name || !document_number) {
      return response(res, 400, { error: "Razón social y número de documento son requeridos" });
    }

    // Verificar si ya existe un proveedor con ese documento
    const existingSupplier = await Supplier.findOne({
      where: { document_number }
    });

    if (existingSupplier) {
      return response(res, 400, { error: `Ya existe un proveedor con el documento ${document_number}` });
    }

    const newSupplier = await Supplier.create({
      business_name,
      document_type: document_type || 'NIT',
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
    });

    console.log(`✅ [CREATE SUPPLIER] Proveedor creado: ${newSupplier.business_name} (${newSupplier.document_number})`);

    response(res, 201, {
      message: "Proveedor creado exitosamente",
      supplier: newSupplier
    });
  } catch (error) {
    console.error("❌ [CREATE SUPPLIER] Error:", error);
    response(res, 500, { error: error.message });
  }
};
