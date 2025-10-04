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
} from "react-icons/fi";
import Loading from "../Loading";

const SupplierDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { currentSupplier, summary, loading } = useSelector((state) => state.suppliers);
  const { data: invoices } = useSelector((state) => state.purchaseInvoices);
  const { data: payments } = useSelector((state) => state.supplierPayments);

  const [activeTab, setActiveTab] = useState("summary");

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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/suppliers")}
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <FiDollarSign className="text-red-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Deuda Total</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(summary?.totalDebt || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiFileText className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Facturas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary?.invoiceStats?.total || 0}
                </p>
                <p className="text-xs text-gray-500">
                  {summary?.invoiceStats?.pending || 0} pendientes
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <FiCreditCard className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Pagado</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary?.totalPaid || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FiAlertCircle className="text-yellow-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Vencidas</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {summary?.invoiceStats?.overdue || 0}
                </p>
              </div>
            </div>
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
                      {currentSupplier.bank_name && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Banco</span>
                          <span className="text-sm font-medium text-gray-900">
                            {currentSupplier.bank_name}
                          </span>
                        </div>
                      )}
                      {currentSupplier.bank_account && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Cuenta</span>
                          <span className="text-sm font-medium text-gray-900">
                            {currentSupplier.bank_account}
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

                    {currentSupplier.notes && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-2">Notas</p>
                        <p className="text-sm text-gray-600">{currentSupplier.notes}</p>
                      </div>
                    )}
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
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {invoices.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                            No hay facturas registradas
                          </td>
                        </tr>
                      ) : (
                        invoices.map((invoice) => (
                          <tr key={invoice.id} className="hover:bg-gray-50">
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
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                              {formatCurrency(invoice.total_amount - (invoice.paid_amount || 0))}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(invoice.status)}
                            </td>
                          </tr>
                        ))
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
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {payments.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                            No hay pagos registrados
                          </td>
                        </tr>
                      ) : (
                        payments.map((payment) => (
                          <tr key={payment.id} className="hover:bg-gray-50">
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
      </div>
    </div>
  );
};

export default SupplierDetail;
