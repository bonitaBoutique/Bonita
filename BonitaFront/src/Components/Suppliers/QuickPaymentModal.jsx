import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { createSupplierPayment } from "../../Redux/Actions/actions";
import { FiX, FiDollarSign, FiUpload, FiCheckCircle } from "react-icons/fi";
import Swal from "sweetalert2";
import { openCloudinaryWidget } from "../../cloudinaryConfig";

const QuickPaymentModal = ({ isOpen, onClose, invoice, supplier, onPaymentSuccess }) => {
  const dispatch = useDispatch();
  
  const [formData, setFormData] = useState({
    payment_date: new Date().toISOString().split("T")[0],
    amount: "",
    payment_method: "Transferencia",
    reference_number: "",
    notes: "",
    receipt_url: "",
    receipt_public_id: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentType, setPaymentType] = useState("partial"); // 'partial' | 'total'

  // Pre-llenar datos cuando se abre el modal
  useEffect(() => {
    if (isOpen && invoice) {
      const pendingAmount = invoice.total_amount - (invoice.paid_amount || 0);
      setFormData({
        payment_date: new Date().toISOString().split("T")[0],
        amount: "",
        payment_method: invoice.payment_method || "Transferencia",
        reference_number: "",
        notes: "",
        receipt_url: "",
        receipt_public_id: "",
      });
      setPaymentType("partial");
    }
  }, [isOpen, invoice]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePaymentTypeChange = (type) => {
    setPaymentType(type);
    if (type === "total" && invoice) {
      const pendingAmount = invoice.total_amount - (invoice.paid_amount || 0);
      setFormData({ ...formData, amount: pendingAmount.toString() });
    } else {
      setFormData({ ...formData, amount: "" });
    }
  };

  const handleFileUpload = () => {
    openCloudinaryWidget(
      (uploadedImageUrl, publicId) => {
        setFormData({
          ...formData,
          receipt_url: uploadedImageUrl,
          receipt_public_id: publicId,
        });
        Swal.fire({
          icon: "success",
          title: "Comprobante cargado",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
        });
      },
      {
        folder: "supplier_payments",
        multiple: false,
        formats: ["jpg", "jpeg", "png", "gif", "webp", "pdf"],
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      Swal.fire("Error", "Debes ingresar un monto válido", "error");
      return;
    }

    const pendingAmount = invoice.total_amount - (invoice.paid_amount || 0);
    if (parseFloat(formData.amount) > pendingAmount) {
      Swal.fire(
        "Error",
        `El monto no puede ser mayor al saldo pendiente: $${pendingAmount.toLocaleString()}`,
        "error"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const paymentData = {
        id_supplier: supplier.id_supplier,
        id_invoice: invoice.id_invoice,
        ...formData,
      };

      await dispatch(createSupplierPayment(paymentData));

      Swal.fire({
        icon: "success",
        title: "¡Pago registrado!",
        text: "El pago se ha registrado correctamente",
        timer: 2000,
        showConfirmButton: false,
      });

      // Llamar callback para actualizar datos
      if (onPaymentSuccess) {
        onPaymentSuccess();
      }

      onClose();
    } catch (error) {
      console.error("Error creating payment:", error);
      Swal.fire("Error", "No se pudo registrar el pago", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !invoice || !supplier) return null;

  const pendingAmount = invoice.total_amount - (invoice.paid_amount || 0);
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Registrar Pago</h2>
            <p className="text-sm text-gray-600 mt-1">
              {supplier.business_name} - Factura #{invoice.invoice_number}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="text-2xl" />
          </button>
        </div>

        {/* Resumen de factura */}
        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-600 mb-1">Total Factura</p>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(invoice.total_amount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Pagado</p>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(invoice.paid_amount || 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Saldo Pendiente</p>
              <p className="text-lg font-bold text-red-600">
                {formatCurrency(pendingAmount)}
              </p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Tipo de pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Pago
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handlePaymentTypeChange("partial")}
                className={`p-4 border-2 rounded-lg transition-all ${
                  paymentType === "partial"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <FiDollarSign />
                  <span className="font-medium">Pago Parcial</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handlePaymentTypeChange("total")}
                className={`p-4 border-2 rounded-lg transition-all ${
                  paymentType === "total"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <FiCheckCircle />
                  <span className="font-medium">Pago Total</span>
                </div>
                <p className="text-xs mt-1">{formatCurrency(pendingAmount)}</p>
              </button>
            </div>
          </div>

          {/* Monto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto a Pagar <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                $
              </span>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
                step="0.01"
                required
                readOnly={paymentType === "total"}
              />
            </div>
            {paymentType === "partial" && (
              <p className="text-xs text-gray-500 mt-1">
                Máximo: {formatCurrency(pendingAmount)}
              </p>
            )}
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Pago <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="payment_date"
              value={formData.payment_date}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Método de pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Método de Pago
            </label>
            <select
              name="payment_method"
              value={formData.payment_method}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Cheque">Cheque</option>
              <option value="Tarjeta">Tarjeta</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          {/* Referencia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Referencia
            </label>
            <input
              type="text"
              name="reference_number"
              value={formData.reference_number}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: TRF-123456"
            />
          </div>

          {/* Comprobante */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comprobante de Pago
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleFileUpload}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FiUpload />
                Subir Comprobante
              </button>
              {formData.receipt_url && (
                <div className="flex items-center gap-2 text-green-600">
                  <FiCheckCircle />
                  <span className="text-sm">Comprobante cargado</span>
                </div>
              )}
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              placeholder="Notas adicionales sobre el pago..."
            />
          </div>

          {/* Botones */}
          <div className="flex items-center gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Registrando..." : "Registrar Pago"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickPaymentModal;
