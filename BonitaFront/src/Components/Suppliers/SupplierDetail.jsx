import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchSupplierById,
  fetchPurchaseInvoices,
  fetchSupplierPayments,
} from "../../Redux/Actions/actions";
import {
  FiArrowLeft,
  FiEdit2,
  FiPhone,
  FiMail,
  FiMapPin,
  FiDollarSign,
  FiFileText,
  FiCreditCard,
  FiAlertCircle,
  FiCalendar,
  FiTrendingUp,
  FiImage,
  FiExternalLink,
} from "react-icons/fi";
import Loading from "../Loading";
import Navbar2 from "../Navbar2";
import QuickPaymentModal from "./QuickPaymentModal";

const SupplierDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { currentSupplier, summary, loading } = useSelector((state) => state.suppliers);
  const { data: invoices } = useSelector((state) => state.purchaseInvoices);
  const { data: payments } = useSelector((state) => state.supplierPayments);

  const [activeTab, setActiveTab] = useState("summary");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const openDocument = (url, title) => {
    console.log('🔍 [DOCUMENT] Abriendo documento:', { url, title });
    // Si es PDF, abrir directamente en nueva pestaña
    if (url.toLowerCase().endsWith('.pdf')) {
      window.open(url, '_blank');
    } else {
      // Si es imagen, mostrar en modal
      setSelectedDocument({ url, title });
      setShowDocumentModal(true);
    }
  };

  const closeDocumentModal = () => {
    setSelectedDocument(null);
    setShowDocumentModal(false);
  };

  const openPaymentModal = (invoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setSelectedInvoice(null);
    setShowPaymentModal(false);
  };

  const handlePaymentSuccess = () => {
    console.log('🔄 [SUPPLIER DETAIL] handlePaymentSuccess llamado - Refrescando datos del proveedor:', id);
    // Recargar datos del proveedor, facturas y pagos
    if (id && id !== 'undefined' && id !== 'null') {
      console.log('✅ [SUPPLIER DETAIL] Despachando acciones de refresh...');
      dispatch(fetchSupplierById(id));
      dispatch(fetchPurchaseInvoices({ id_supplier: id, limit: 50 }));
      dispatch(fetchSupplierPayments({ id_supplier: id, limit: 50 }));
    } else {
      console.warn('⚠️ [SUPPLIER DETAIL] ID inválido, no se puede refrescar:', id);
    }
  };

  useEffect(() => {
    // Solo hacer las llamadas si id es válido
    if (id && id !== 'undefined' && id !== 'null') {
      dispatch(fetchSupplierById(id));
      dispatch(fetchPurchaseInvoices({ id_supplier: id, limit: 50 }));
      dispatch(fetchSupplierPayments({ id_supplier: id, limit: 50 }));
    }
  }, [dispatch, id]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calcular el total real de pagos desde el array de payments
  const calculateTotalPaid = () => {
    if (!payments || payments.length === 0) return 0;
    return payments.reduce((total, payment) => {
      return total + (parseFloat(payment.amount) || 0);
    }, 0);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      partial: "bg-blue-100 text-blue-800",
      paid: "bg-green-100 text-green-800",
      overdue: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
    };
    const labels = {
      pending: "Pendiente",
      partial: "Parcial",
      paid: "Pagada",
      overdue: "Vencida",
      cancelled: "Cancelada",
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading || !currentSupplier) {
    return <Loading />;
  }

  return (
    <>
      <Navbar2/>
      <div className="min-h-screen bg-gray-50 p-6 mt-20">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/panelProveedores")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <FiArrowLeft />
            Volver a proveedores
          </button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {currentSupplier.business_name}
              </h1>
              <p className="text-gray-600 mt-1">
                {currentSupplier.document_type}: {currentSupplier.document_number}
              </p>
            </div>
            <button
              onClick={() => navigate(`/suppliers/edit/${id}`)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiEdit2 />
              Editar
            </button>
          </div>
        </div>

        {/* Summary Cards - Rediseñadas más prominentes */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <FiDollarSign className="text-2xl" />
              </div>
              <div className="flex-1">
                <p className="text-sm opacity-90">Deuda Total</p>
                <p className="text-3xl font-bold">
                  {formatCurrency(summary?.totalDebt || 0)}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white border-opacity-20">
              <button
                onClick={() => navigate(`/suppliers/payments/create?supplierId=${id}`)}
                className="w-full flex items-center justify-center gap-2 bg-white text-red-600 px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors font-medium text-sm"
              >
                <FiDollarSign />
                Registrar Pago
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <FiFileText className="text-2xl" />
              </div>
              <div className="flex-1">
                <p className="text-sm opacity-90">Facturas</p>
                <p className="text-3xl font-bold">
                  {summary?.invoiceStats?.total || 0}
                </p>
                <p className="text-xs opacity-75 mt-1">
                  {summary?.invoiceStats?.pending || 0} pendientes
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white border-opacity-20">
              <button
                onClick={() => navigate(`/suppliers/${id}/invoices/new`)}
                className="w-full flex items-center justify-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors font-medium text-sm"
              >
                <FiFileText />
                Nueva Factura
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <FiCreditCard className="text-2xl" />
              </div>
              <div className="flex-1">
                <p className="text-sm opacity-90">Total Pagado</p>
                <p className="text-3xl font-bold">
                  {formatCurrency(calculateTotalPaid())}
                </p>
                <p className="text-xs opacity-75 mt-1">
                  {payments.length} pago{payments.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white border-opacity-20 text-xs opacity-90">
              Último pago: {payments.length > 0 ? formatDate(payments[0].payment_date) : 'N/A'}
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <FiAlertCircle className="text-2xl" />
              </div>
              <div className="flex-1">
                <p className="text-sm opacity-90">Vencidas</p>
                <p className="text-3xl font-bold">
                  {summary?.invoiceStats?.overdue || 0}
                </p>
                <p className="text-xs opacity-75 mt-1">
                  Requieren atención
                </p>
              </div>
            </div>
            {(summary?.invoiceStats?.overdue || 0) > 0 && (
              <div className="mt-4 pt-4 border-t border-white border-opacity-20">
                <button
                  onClick={() => setActiveTab("invoices")}
                  className="w-full flex items-center justify-center gap-2 bg-white text-yellow-600 px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors font-medium text-sm"
                >
                  Ver Facturas
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Información de Contacto
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentSupplier.contact_name && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <FiPhone className="text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Contacto</p>
                  <p className="text-sm font-medium text-gray-900">
                    {currentSupplier.contact_name}
                  </p>
                </div>
              </div>
            )}

            {currentSupplier.phone && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <FiPhone className="text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Teléfono</p>
                  <p className="text-sm font-medium text-gray-900">
                    {currentSupplier.phone}
                  </p>
                </div>
              </div>
            )}

            {currentSupplier.email && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <FiMail className="text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-sm font-medium text-gray-900">
                    {currentSupplier.email}
                  </p>
                </div>
              </div>
            )}

            {currentSupplier.address && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <FiMapPin className="text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Dirección</p>
                  <p className="text-sm font-medium text-gray-900">
                    {currentSupplier.address}
                  </p>
                </div>
              </div>
            )}

            {currentSupplier.city && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <FiMapPin className="text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ciudad</p>
                  <p className="text-sm font-medium text-gray-900">
                    {currentSupplier.city}, {currentSupplier.country}
                  </p>
                </div>
              </div>
            )}

            {currentSupplier.payment_terms && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <FiCalendar className="text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Términos de Pago</p>
                  <p className="text-sm font-medium text-gray-900">
                    {currentSupplier.payment_terms}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("summary")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "summary"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Resumen
              </button>
              <button
                onClick={() => setActiveTab("invoices")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "invoices"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Facturas ({invoices.length})
              </button>
              <button
                onClick={() => setActiveTab("payments")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "payments"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Pagos ({payments.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Summary Tab */}
            {activeTab === "summary" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Facturas por Estado
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <span className="text-sm text-gray-700">Pendientes</span>
                        <span className="font-semibold text-yellow-700">
                          {summary?.invoiceStats?.pending || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm text-gray-700">Parciales</span>
                        <span className="font-semibold text-blue-700">
                          {summary?.invoiceStats?.partial || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="text-sm text-gray-700">Pagadas</span>
                        <span className="font-semibold text-green-700">
                          {summary?.invoiceStats?.paid || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <span className="text-sm text-gray-700">Vencidas</span>
                        <span className="font-semibold text-red-700">
                          {summary?.invoiceStats?.overdue || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Información Adicional
                    </h3>
                    <div className="space-y-3">
                      {currentSupplier.category && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Categoría</span>
                          <span className="text-sm font-medium text-gray-900">
                            {currentSupplier.category}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Estado</span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            currentSupplier.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {currentSupplier.status === "active" ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Invoices Tab */}
            {activeTab === "invoices" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Facturas de Compra
                  </h3>
                  <button
                    onClick={() => navigate(`/suppliers/${id}/invoices/new`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Nueva Factura
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Número
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Fecha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Vencimiento
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Pagado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Saldo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Factura
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {invoices.length === 0 ? (
                        <tr>
                          <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                            No hay facturas registradas
                          </td>
                        </tr>
                      ) : (
                        invoices.map((invoice) => {
                          const balance = invoice.total_amount - (invoice.paid_amount || 0);
                          const isPaid = invoice.status === 'paid';
                          const isCancelled = invoice.status === 'cancelled';
                          
                          return (
                          <tr key={invoice.id_invoice} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {invoice.invoice_number}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(invoice.invoice_date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {invoice.due_date ? formatDate(invoice.due_date) : "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(invoice.total_amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                              {formatCurrency(invoice.paid_amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                              {formatCurrency(balance)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(invoice.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {invoice.invoice_url ? (
                                <button
                                  onClick={() => openDocument(invoice.invoice_url, `Factura ${invoice.invoice_number}`)}
                                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                                  title="Ver factura"
                                >
                                  <FiImage className="text-lg" />
                                  <FiExternalLink className="text-xs" />
                                </button>
                              ) : (
                                <span className="text-gray-400 text-sm">Sin factura</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {!isPaid && !isCancelled ? (
                                <button
                                  onClick={() => openPaymentModal(invoice)}
                                  className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                  title="Registrar pago"
                                >
                                  <FiDollarSign className="text-base" />
                                  Pagar
                                </button>
                              ) : (
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                            </td>
                          </tr>
                        );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === "payments" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Historial de Pagos
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Fecha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Factura
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Monto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Método
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Referencia
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Comprobante
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {payments.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                            No hay pagos registrados
                          </td>
                        </tr>
                      ) : (
                        payments.map((payment) => (
                          <tr key={payment.id_payment} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(payment.payment_date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {payment.invoice?.invoice_number || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                              {formatCurrency(payment.amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {payment.payment_method || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {payment.reference_number || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {payment.receipt_url ? (
                                <button
                                  onClick={() => openDocument(payment.receipt_url, `Comprobante de Pago ${payment.reference_number || payment.id_payment}`)}
                                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                                  title="Ver comprobante"
                                >
                                  <FiImage className="text-lg" />
                                  <FiExternalLink className="text-xs" />
                                </button>
                              ) : (
                                <span className="text-gray-400 text-sm">Sin comprobante</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal para mostrar documentos (PDF/imágenes) */}
        {showDocumentModal && selectedDocument && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closeDocumentModal}
          >
            <div
              className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header del Modal */}
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedDocument.title}
                </h3>
                <div className="flex items-center gap-2">
                  <a
                    href={selectedDocument.url}
                    download
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Descargar
                  </a>
                  <button
                    onClick={closeDocumentModal}
                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Contenido del Modal */}
              <div className="flex-1 overflow-auto p-4 bg-gray-50">
                {/* Visor de Imágenes */}
                <div className="flex items-center justify-center h-full min-h-[400px]">
                  <img
                    src={selectedDocument.url}
                    alt={selectedDocument.title}
                    className="max-w-full max-h-full object-contain rounded shadow-lg"
                    onError={(e) => {
                      console.error('Error cargando imagen:', selectedDocument.url);
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5FcnJvciBjYXJnYW5kbyBpbWFnZW48L3RleHQ+PC9zdmc+';
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Pago Rápido */}
        <QuickPaymentModal
          isOpen={showPaymentModal}
          onClose={closePaymentModal}
          invoice={selectedInvoice}
          supplier={currentSupplier}
          onPaymentSuccess={handlePaymentSuccess}
        />
      </div>
    </div>
    </>
  );
};

export default SupplierDetail;
