import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  createSupplier,
  updateSupplier,
  fetchSupplierById,
} from "../../Redux/Actions/actions";
import { FiSave, FiX, FiArrowLeft } from "react-icons/fi";
import Loading from "../Loading";

const SupplierForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const { currentSupplier, loading } = useSelector((state) => state.suppliers);

  const [formData, setFormData] = useState({
    business_name: "",
    document_type: "NIT",
    document_number: "",
    contact_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "Colombia",
    category: "",
    payment_terms: "",
    bank_name: "",
    bank_account: "",
    notes: "",
    status: "active",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Solo cargar supplier si está en modo edición y el ID es válido
    if (isEditMode && id && id !== 'undefined' && id !== 'null') {
      dispatch(fetchSupplierById(id));
    }
  }, [dispatch, id, isEditMode]);

  useEffect(() => {
    if (isEditMode && currentSupplier) {
      setFormData({
        business_name: currentSupplier.business_name || "",
        document_type: currentSupplier.document_type || "NIT",
        document_number: currentSupplier.document_number || "",
        contact_name: currentSupplier.contact_name || "",
        email: currentSupplier.email || "",
        phone: currentSupplier.phone || "",
        address: currentSupplier.address || "",
        city: currentSupplier.city || "",
        country: currentSupplier.country || "Colombia",
        category: currentSupplier.category || "",
        payment_terms: currentSupplier.payment_terms || "",
        bank_name: currentSupplier.bank_name || "",
        bank_account: currentSupplier.bank_account || "",
        notes: currentSupplier.notes || "",
        status: currentSupplier.status || "active",
      });
    }
  }, [currentSupplier, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.business_name.trim()) {
      newErrors.business_name = "La razón social es requerida";
    }

    if (!formData.document_number.trim()) {
      newErrors.document_number = "El número de documento es requerido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (isEditMode) {
        await dispatch(updateSupplier(id, formData));
      } else {
        await dispatch(createSupplier(formData));
      }
      navigate("/suppliers");
    } catch (error) {
      console.error("Error saving supplier:", error);
    }
  };

  const handleCancel = () => {
    navigate("/suppliers");
  };

  if (loading && isEditMode && !currentSupplier) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/suppliers")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <FiArrowLeft />
            Volver a proveedores
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? "Editar Proveedor" : "Nuevo Proveedor"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditMode
              ? "Actualiza la información del proveedor"
              : "Completa los datos del nuevo proveedor"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
          {/* Información Básica */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Información Básica
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Razón Social <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="business_name"
                  value={formData.business_name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.business_name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Nombre de la empresa"
                />
                {errors.business_name && (
                  <p className="mt-1 text-sm text-red-500">{errors.business_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Documento
                </label>
                <select
                  name="document_type"
                  value={formData.document_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="NIT">NIT</option>
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="CE">Cédula de Extranjería</option>
                  <option value="RUT">RUT</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Documento <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="document_number"
                  value={formData.document_number}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.document_number ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="123456789"
                />
                {errors.document_number && (
                  <p className="mt-1 text-sm text-red-500">{errors.document_number}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Textiles, Accesorios, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Información de Contacto
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de Contacto
                </label>
                <input
                  type="text"
                  name="contact_name"
                  value={formData.contact_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="3001234567"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="proveedor@ejemplo.com"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Calle, número, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ciudad"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">País</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Información Comercial */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Información Comercial y Bancaria
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Términos de Pago
                </label>
                <input
                  type="text"
                  name="payment_terms"
                  value={formData.payment_terms}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: 30 días, Contado, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banco
                </label>
                <input
                  type="text"
                  name="bank_name"
                  value={formData.bank_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre del banco"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Cuenta
                </label>
                <input
                  type="text"
                  name="bank_account"
                  value={formData.bank_account}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Número de cuenta bancaria"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notas</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Notas adicionales sobre el proveedor..."
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FiX />
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <FiSave />
              {loading ? "Guardando..." : isEditMode ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierForm;
