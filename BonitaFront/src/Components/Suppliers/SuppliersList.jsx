import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchSuppliers,
  deleteSupplier,
} from "../../Redux/Actions/actions";
import Swal from "sweetalert2";
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiEye, FiFilter, FiFileText, FiDollarSign, FiAlertCircle, FiTrendingUp } from "react-icons/fi";
import Loading from "../Loading";
import Navbar2 from "../Navbar2";

const SuppliersList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { data: suppliers, loading, error, pagination } = useSelector(
    (state) => state.suppliers
  );

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    category: "",
    page: 1,
    limit: 20,
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchSuppliers(filters));
  }, [dispatch, filters.page, filters.limit]);

  const handleSearch = () => {
    setFilters({ ...filters, page: 1 });
    dispatch(fetchSuppliers(filters));
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      status: "",
      category: "",
      page: 1,
      limit: 20,
    });
    dispatch(fetchSuppliers({ page: 1, limit: 20 }));
  };

  const handleDelete = async (id, businessName) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: `Se eliminará el proveedor ${businessName}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await dispatch(deleteSupplier(id));
        dispatch(fetchSuppliers(filters));
      } catch (error) {
        console.error("Error deleting supplier:", error);
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-red-100 text-red-800",
    };
    const labels = {
      active: "Activo",
      inactive: "Inactivo",
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (loading && suppliers.length === 0) {
    return <Loading />;
  }

  // Calcular resumen general
  const totalDebt = suppliers.reduce((sum, s) => sum + (s.totalDebt || 0), 0);
  const totalSuppliers = suppliers.length;
  const suppliersWithDebt = suppliers.filter(s => (s.totalDebt || 0) > 0).length;
  const totalInvoices = suppliers.reduce((sum, s) => sum + (s.invoiceCount || 0), 0);

  return (
    <>
      <Navbar2/>
      <div className="min-h-screen bg-gray-50 p-6 mt-20">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Proveedores</h1>
              <p className="text-gray-600 mt-1">
                Gestiona tus proveedores y facturas de compra
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/suppliers/invoices/create")}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <FiFileText className="text-xl" />
                Nueva Factura
              </button>
              <button
                onClick={() => navigate("/suppliers/new")}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiPlus className="text-xl" />
                Nuevo Proveedor
              </button>
            </div>
          </div>

          {/* Resumen General */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                  <FiTrendingUp className="text-2xl" />
                </div>
              </div>
              <p className="text-sm opacity-90 mb-1">Total Proveedores</p>
              <p className="text-3xl font-bold">{totalSuppliers}</p>
              <p className="text-xs opacity-75 mt-1">Activos en el sistema</p>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                  <FiDollarSign className="text-2xl" />
                </div>
              </div>
              <p className="text-sm opacity-90 mb-1">Deuda Total</p>
              <p className="text-3xl font-bold">{formatCurrency(totalDebt)}</p>
              <p className="text-xs opacity-75 mt-1">{suppliersWithDebt} proveedores con deuda</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                  <FiFileText className="text-2xl" />
                </div>
              </div>
              <p className="text-sm opacity-90 mb-1">Total Facturas</p>
              <p className="text-3xl font-bold">{totalInvoices}</p>
              <p className="text-xs opacity-75 mt-1">Facturas registradas</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                  <FiAlertCircle className="text-2xl" />
                </div>
              </div>
              <p className="text-sm opacity-90 mb-1">Requieren Atención</p>
              <p className="text-3xl font-bold">{suppliersWithDebt}</p>
              <p className="text-xs opacity-75 mt-1">Con saldo pendiente</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, documento, contacto o email..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FiFilter />
              Filtros
            </button>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Buscar
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <input
                  type="text"
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  placeholder="Ej: Textiles, Accesorios..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleClearFilters}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Limpiar Filtros
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proveedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deuda Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Facturas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {suppliers.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                      No se encontraron proveedores
                    </td>
                  </tr>
                ) : (
                  suppliers.map((supplier) => {
                    const hasDebt = (supplier.totalDebt || 0) > 0;
                    const hasHighDebt = (supplier.totalDebt || 0) > 1000000; // Mayor a 1M
                    
                    return (
                    <tr 
                      key={supplier.id_supplier} 
                      className={`hover:bg-gray-50 transition-colors ${
                        hasHighDebt ? 'bg-red-50' : hasDebt ? 'bg-yellow-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {hasHighDebt && (
                            <div className="flex-shrink-0">
                              <FiAlertCircle className="text-red-500 text-lg" title="Deuda alta" />
                            </div>
                          )}
                          <div className="flex flex-col">
                            <div className="text-sm font-medium text-gray-900">
                              {supplier.business_name}
                            </div>
                            {supplier.contact_name && (
                              <div className="text-sm text-gray-500">
                                {supplier.contact_name}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {supplier.document_type}: {supplier.document_number}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{supplier.phone || "-"}</div>
                        <div className="text-sm text-gray-500">{supplier.email || "-"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {supplier.category || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div
                            className={`text-sm font-semibold ${
                              supplier.totalDebt > 0 ? "text-red-600" : "text-green-600"
                            }`}
                          >
                            {formatCurrency(supplier.totalDebt || 0)}
                          </div>
                          {hasDebt && (
                            <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block w-fit ${
                              hasHighDebt 
                                ? 'bg-red-100 text-red-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {hasHighDebt ? 'Deuda alta' : 'Pendiente'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {supplier.invoiceCount || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(supplier.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/suppliers/${supplier.id_supplier}`)}
                            className="text-blue-600 hover:text-blue-900 transition-colors p-1.5 rounded hover:bg-blue-50"
                            title="Ver detalles"
                          >
                            <FiEye className="text-lg" />
                          </button>
                          <button
                            onClick={() => navigate(`/suppliers/edit/${supplier.id_supplier}`)}
                            className="text-yellow-600 hover:text-yellow-900 transition-colors p-1.5 rounded hover:bg-yellow-50"
                            title="Editar"
                          >
                            <FiEdit2 className="text-lg" />
                          </button>
                          <button
                            onClick={() => handleDelete(supplier.id_supplier, supplier.business_name)}
                            className="text-red-600 hover:text-red-900 transition-colors p-1.5 rounded hover:bg-red-50"
                            title="Eliminar"
                          >
                            <FiTrash2 className="text-lg" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  disabled={filters.page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  disabled={filters.page === pagination.totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando{" "}
                    <span className="font-medium">
                      {(filters.page - 1) * filters.limit + 1}
                    </span>{" "}
                    a{" "}
                    <span className="font-medium">
                      {Math.min(filters.page * filters.limit, pagination.total)}
                    </span>{" "}
                    de <span className="font-medium">{pagination.total}</span> resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                      disabled={filters.page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    {[...Array(pagination.totalPages)].map((_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => setFilters({ ...filters, page: index + 1 })}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          filters.page === index + 1
                            ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                      disabled={filters.page === pagination.totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Siguiente
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default SuppliersList;
