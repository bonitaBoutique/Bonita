const { Supplier } = require("../../data");
const response = require("../../utils/response");

module.exports = async (req, res) => {
  try {
    const { id } = req.params;

    const supplier = await Supplier.findByPk(id);

    if (!supplier) {
      return response(res, 404, { error: "Proveedor no encontrado" });
    }

    // Soft delete (paranoid: true)
    await supplier.destroy();

    console.log(`✅ [DELETE SUPPLIER] Proveedor eliminado: ${supplier.business_name} (ID: ${id})`);

    response(res, 200, {
      message: "Proveedor eliminado exitosamente"
    });
  } catch (error) {
    console.error("❌ [DELETE SUPPLIER] Error:", error);
    response(res, 500, { error: error.message });
  }
};
