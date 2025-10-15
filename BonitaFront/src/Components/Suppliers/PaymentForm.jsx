import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchSuppliers,
  fetchPurchaseInvoices,
  createSupplierPayment,
} from "../../Redux/Actions/actions";
import Swal from "sweetalert2";
import { FiArrowLeft, FiDollarSign, FiUpload } from "react-icons/fi";
import Navbar2 from "../Navbar2";
import Loading from "../Loading";
import { openCloudinaryWidget } from "../../cloudinaryConfig";

const CLOUDINARY_CLOUD_NAME = "dikg5d5ih";
const CLOUDINARY_UPLOAD_PRESET = "ecommerce-products";

const PaymentForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { supplierId } = useParams();

  const { data: suppliers, loading: loadingSuppliers } = useSelector(
    (state) => state.suppliers
  );
  const { data: invoices, loading: loadingInvoices } = useSelector(
    (state) => state.purchaseInvoices
  );

  const [formData, setFormData] = useState({
    id_supplier: supplierId || "",
    id_invoice: "",
    payment_date: new Date().toISOString().split("T")[0],
    amount: "",
    payment_method: "Transferencia",
    reference_number: "",
    notes: "",
    receipt_url: "",
    receipt_public_id: "",
  });

  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    if (suppliers.length === 0) {
      dispatch(fetchSuppliers({ page: 1, limit: 100 }));
    }
  }, [dispatch, suppliers.length]);

  useEffect(() => {
    if (formData.id_supplier && formData.id_supplier !== 'undefined') {
      dispatch(fetchPurchaseInvoices({ 
        supplierId: formData.id_supplier,
        status: 'pending,partial',
        page: 1, 
        limit: 100 
      }));
    }
  }, [dispatch, formData.id_supplier]);

  useEffect(() => {
    if (formData.id_invoice && invoices.length > 0) {
      const invoice = invoices.find(inv => inv.id_invoice === formData.id_invoice);
      setSelectedInvoice(invoice);
      
      // ✅ Pre-llenar método de pago si la factura tiene uno
      if (invoice?.payment_method) {
        setFormData(prev => ({
          ...prev,
          payment_method: invoice.payment_method
        }));
      }
    }
  }, [formData.id_invoice, invoices]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileUpload = () => {
    // Usar el widget de Cloudinary (igual que en facturas)
    openCloudinaryWidget(
      (uploadedImageUrl, publicId) => {
        console.log('📤 [CLOUDINARY] Comprobante subido:', { uploadedImageUrl, publicId });
        setFormData({
          ...formData,
          receipt_url: uploadedImageUrl,
          receipt_public_id: publicId,
        });
        Swal.fire("Éxito", "Comprobante cargado correctamente", "success");
      },
      {
        folder: 'supplier_payments',
        multiple: false, // Solo una imagen
        formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'], // Solo imágenes
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.id_supplier || !formData.id_invoice || !formData.amount) {
      Swal.fire("Error", "Por favor completa todos los campos requeridos", "error");
      return;
    }

    if (selectedInvoice) {
      const pendingAmount = selectedInvoice.total_amount - (selectedInvoice.paid_amount || 0);
      if (parseFloat(formData.amount) > pendingAmount) {
        Swal.fire(
          "Error",
          `El monto no puede ser mayor al saldo pendiente: $${pendingAmount.toLocaleString()}`,
          "error"
        );
        return;
      }
    }

    try {
      await dispatch(createSupplierPayment(formData));
      
      // ✅ Recargar facturas para actualizar estados
      if (formData.id_supplier) {
        await dispatch(fetchPurchaseInvoices({ 
          supplierId: formData.id_supplier,
          status: 'pending,partial',
          page: 1, 
          limit: 100 
        }));
      }
      
      Swal.fire("Éxito", "Pago registrado correctamente", "success");
      navigate(`/suppliers/${formData.id_supplier}`);
    } catch (error) {
      console.error("Error creating payment:", error);
      Swal.fire("Error", "No se pudo registrar el pago", "error");
    }
  };

  if (loadingSuppliers) {
    return <Loading />;
  }

  const pendingInvoices = invoices.filter(
    inv => inv.status === 'pending' || inv.status === 'partial'
  );

  return (
    <>
      <Navbar2 />
      <div className="min-h-screen bg-gray-50 p-6 mt-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <FiArrowLeft />
              Volver
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              💰 Registrar Pago a Proveedor
            </h1>
            <p className="text-gray-600 mt-1">
              Registra un pago parcial o total de una factura de compra
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Proveedor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proveedor <span className="text-red-500">*</span>
                </label>
                <select
                  name="id_supplier"
                  value={formData.id_supplier}
                  onChange={handleChange}
                  required
                  disabled={!!supplierId}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar proveedor</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id_supplier} value={supplier.id_supplier}>
                      {supplier.business_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Factura */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Factura <span className="text-red-500">*</span>
                </label>
                <select
                  name="id_invoice"
                  value={formData.id_invoice}
                  onChange={handleChange}
                  required
                  disabled={!formData.id_supplier || loadingInvoices}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar factura</option>
                  {pendingInvoices.map((invoice) => (
                    <option key={invoice.id_invoice} value={invoice.id_invoice}>
                      {invoice.invoice_number} - Saldo: $
                      {(invoice.total_amount - (invoice.paid_amount || 0)).toLocaleString()}
                    </option>
                  ))}
                </select>
                {loadingInvoices && (
                  <p className="text-sm text-gray-500 mt-1">Cargando facturas...</p>
                )}
              </div>

              {/* Fecha de Pago */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Pago <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="payment_date"
                  value={formData.payment_date}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Monto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {selectedInvoice && (
                  <p className="text-sm text-gray-500 mt-1">
                    Saldo pendiente: $
                    {(selectedInvoice.total_amount - (selectedInvoice.paid_amount || 0)).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Método de Pago */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Método de Pago
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

              {/* Número de Referencia */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Referencia
                </label>
                <input
                  type="text"
                  name="reference_number"
                  value={formData.reference_number}
                  onChange={handleChange}
                  placeholder="Ej: 123456789"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Notas */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Observaciones adicionales..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Cargar Comprobante */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comprobante de Pago (Opcional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {formData.receipt_url ? (
                    <div>
                      <p className="text-sm text-green-600 mb-2">✓ Comprobante cargado</p>
                      <img 
                        src={formData.receipt_url} 
                        alt="Comprobante" 
                        className="max-h-40 mx-auto rounded mb-2"
                      />
                      <a
                        href={formData.receipt_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Ver comprobante
                      </a>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, receipt_url: "", receipt_public_id: "" })
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
                        Sube una imagen del comprobante de pago (JPG, PNG)
                      </p>
                      <button
                        type="button"
                        onClick={handleFileUpload}
                        className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                      >
                        Subir Comprobante
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 mt-8">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Registrar Pago
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default PaymentForm;
