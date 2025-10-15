import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  createPurchaseInvoice,
  fetchSuppliers,
  fetchSupplierById,
} from "../../Redux/Actions/actions";
import { FiSave, FiX, FiArrowLeft, FiUpload } from "react-icons/fi";
import Loading from "../Loading";
import { openCloudinaryWidget } from "../../cloudinaryConfig";
import Navbar2 from "../Navbar2";

const CLOUDINARY_CLOUD_NAME = "dikg5d5ih";
const CLOUDINARY_UPLOAD_PRESET = "ecommerce-products";

const PurchaseInvoiceForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { supplierId } = useParams();

  const { data: suppliers, currentSupplier, loading: suppliersLoading } = useSelector(
    (state) => state.suppliers
  );
  const { loading: invoiceLoading } = useSelector((state) => state.purchaseInvoices);

  const [formData, setFormData] = useState({
    id_supplier: supplierId || "",
    invoice_number: "",
    invoice_date: new Date().toISOString().split("T")[0],
    due_date: "",
    total_amount: "",
    tax_amount: "",
    payment_method: "Efectivo",
    description: "",
    invoice_url: "",
    invoice_public_id: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!supplierId) {
      // Si no hay supplierId en la URL, cargar lista de proveedores
      dispatch(fetchSuppliers({ limit: 100, status: "active" }));
    } else {
      // Solo llamar fetchSupplierById si supplierId es válido
      if (supplierId && supplierId !== 'undefined') {
        dispatch(fetchSupplierById(supplierId));
      }
    }
  }, [dispatch, supplierId]);

  useEffect(() => {
    if (supplierId && supplierId !== 'undefined' && currentSupplier) {
      setFormData((prev) => ({ ...prev, id_supplier: supplierId }));
    }
  }, [supplierId, currentSupplier]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleFileUpload = () => {
    // Usar el widget de Cloudinary (igual que en productos)
    openCloudinaryWidget(
      (uploadedImageUrl, publicId) => {
        console.log('📤 [CLOUDINARY] Imagen subida:', { uploadedImageUrl, publicId });
        setFormData({
          ...formData,
          invoice_url: uploadedImageUrl,
          invoice_public_id: publicId,
        });
      },
      {
        folder: 'supplier_invoices',
        multiple: false, // Solo una imagen
        formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'], // Solo imágenes
      }
    );
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.id_supplier) {
      newErrors.id_supplier = "Debes seleccionar un proveedor";
    }
    if (!formData.invoice_number.trim()) {
      newErrors.invoice_number = "El número de factura es requerido";
    }
    if (!formData.invoice_date) {
      newErrors.invoice_date = "La fecha de factura es requerida";
    }
    if (!formData.total_amount || parseFloat(formData.total_amount) <= 0) {
      newErrors.total_amount = "El monto total debe ser mayor a cero";
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
      const invoiceData = {
        ...formData,
        total_amount: parseFloat(formData.total_amount),
        tax_amount: parseFloat(formData.tax_amount) || 0,
      };

      await dispatch(createPurchaseInvoice(invoiceData));
      
      if (supplierId) {
        navigate(`/suppliers/${supplierId}`);
      } else {
        navigate("/suppliers");
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
    }
  };

  const handleCancel = () => {
    if (supplierId) {
      navigate(`/suppliers/${supplierId}`);
    } else {
      navigate("/suppliers");
    }
  };

  if (suppliersLoading && !currentSupplier && supplierId) {
    return <Loading />;
  }

  return (
    <>
      <Navbar2/>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <FiArrowLeft />
            Volver
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Nueva Factura de Compra</h1>
          <p className="text-gray-600 mt-1">Registra una nueva factura de proveedor</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
          {/* Supplier Selection */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Proveedor</h2>
            {supplierId && currentSupplier ? (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Proveedor seleccionado</p>
                <p className="text-lg font-semibold text-gray-900">
                  {currentSupplier.business_name}
                </p>
                <p className="text-sm text-gray-600">
                  {currentSupplier.document_type}: {currentSupplier.document_number}
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar Proveedor <span className="text-red-500">*</span>
                </label>
                <select
                  name="id_supplier"
                  value={formData.id_supplier}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.id_supplier ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">-- Selecciona un proveedor --</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id_supplier} value={supplier.id_supplier}>
                      {supplier.business_name} - {supplier.document_number}
                    </option>
                  ))}
                </select>
                {errors.id_supplier && (
                  <p className="mt-1 text-sm text-red-500">{errors.id_supplier}</p>
                )}
              </div>
            )}
          </div>

          {/* Invoice Details */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Datos de la Factura
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Factura <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="invoice_number"
                  value={formData.invoice_number}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.invoice_number ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="FV-001"
                />
                {errors.invoice_number && (
                  <p className="mt-1 text-sm text-red-500">{errors.invoice_number}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Factura <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="invoice_date"
                  value={formData.invoice_date}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.invoice_date ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.invoice_date && (
                  <p className="mt-1 text-sm text-red-500">{errors.invoice_date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Vencimiento
                </label>
                <input
                  type="date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medio de Pago <span className="text-red-500">*</span>
                </label>
                <select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Efectivo">Efectivo</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Nequi">Nequi</option>
                  <option value="Crédito">Crédito</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto Total <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="total_amount"
                  value={formData.total_amount}
                  onChange={handleChange}
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.total_amount ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="0.00"
                />
                {errors.total_amount && (
                  <p className="mt-1 text-sm text-red-500">{errors.total_amount}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Impuestos (IVA)
                </label>
                <input
                  type="number"
                  name="tax_amount"
                  value={formData.tax_amount}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Descripción de los productos o servicios..."
                />
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Factura del Proveedor (Opcional)
            </h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {formData.invoice_url ? (
                <div>
                  <p className="text-sm text-green-600 mb-2">✓ Imagen subida</p>
                  <img 
                    src={formData.invoice_url} 
                    alt="Vista previa" 
                    className="max-h-40 mx-auto rounded mb-2"
                  />
                  <a
                    href={formData.invoice_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Ver factura
                  </a>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, invoice_url: "", invoice_public_id: "" })
                    }
                    className="ml-4 text-red-600 hover:text-red-800 text-sm"
                  >
                    Eliminar
                  </button>
                </div>
              ) : (
                <div>
                  <FiUpload className="mx-auto text-gray-400 text-3xl mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Sube una imagen de la factura (JPG, PNG)
                  </p>
                  <button
                    type="button"
                    onClick={handleFileUpload}
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                  >
                    Subir Imagen
                  </button>
                </div>
              )}
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
              disabled={invoiceLoading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <FiSave />
              {invoiceLoading ? "Guardando..." : "Guardar Factura"}
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
};

export default PurchaseInvoiceForm;
