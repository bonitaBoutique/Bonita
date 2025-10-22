import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../Config";
// ✅ Importar utilidades de fecha para Colombia
import { getColombiaDate, formatDateForDisplay } from "../../utils/dateUtils";


const InvoicesList = () => {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState({});
  const [loading, setLoading] = useState(true);

  const [searchFactura, setSearchFactura] = useState("");
  const [searchCliente, setSearchCliente] = useState("");
  // ✅ Cambiar de fecha única a rango de fechas
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/invoice/allInvoices`);
        setInvoices(res.data.invoices || []);
        // Obtener todos los buyerId únicos
        const buyerIds = [...new Set((res.data.invoices || []).map(inv => inv.buyerId))];
        // Buscar datos de clientes
        const clientsData = {};
        for (const id of buyerIds) {
          try {
            const clientRes = await axios.get(`${BASE_URL}/user/${id}`);
            clientsData[id] = clientRes.data.message;
          } catch {
            clientsData[id] = null;
          }
        }
        setClients(clientsData);
      } catch (err) {
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const getDianLink = (taxxaResponse) => {
    if (!taxxaResponse?.jret) return null;

    const sqr = taxxaResponse.jret.sqr;
    if (typeof sqr === "string") {
      const match = sqr.match(/https?:\/\/[^\s]+/i);
      if (match && match[0]) {
        return match[0];
      }
    }

    const scufe = taxxaResponse.jret.scufe;
    if (scufe) {
      const normalizedScufe = encodeURIComponent(scufe.trim());
      console.log("Normalized SCUFE:", normalizedScufe);
      return `https://catalogo-vpfe.dian.gov.co/Document/ShowDocumentToPublic?documentKey=${normalizedScufe}`;
    }

    return null;
  };

  const filteredInvoices = invoices.filter((inv) => {
    const client = clients[inv.buyerId];
    const clienteNombre = client ? `${client.first_name || ""} ${client.last_name || ""}` : "";
    const fecha = new Date(inv.createdAt).toISOString().split("T")[0];
    
    // ✅ Filtro por rango de fechas
    let cumpleFecha = true;
    if (fechaInicio && fechaFin) {
      cumpleFecha = fecha >= fechaInicio && fecha <= fechaFin;
    } else if (fechaInicio) {
      cumpleFecha = fecha >= fechaInicio;
    } else if (fechaFin) {
      cumpleFecha = fecha <= fechaFin;
    }
    
    return (
      (!searchFactura || inv.invoiceNumber.toLowerCase().includes(searchFactura.toLowerCase())) &&
      (!searchCliente || clienteNombre.toLowerCase().includes(searchCliente.toLowerCase())) &&
      cumpleFecha
    );
  });

  // Paginación
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => setCurrentPage(page);

  // Paginación con máximo 5 botones
  const getPageNumbers = () => {
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);
    if (currentPage <= 2) end = Math.min(5, totalPages);
    if (currentPage >= totalPages - 1) start = Math.max(1, totalPages - 4);
    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-gray-100 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Listado de Facturas</h2>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">🔍 Filtros de Búsqueda</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de Factura
            </label>
            <input
              type="text"
              placeholder="Buscar factura..."
              value={searchFactura}
              onChange={e => { setSearchFactura(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Cliente
            </label>
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={searchCliente}
              onChange={e => { setSearchCliente(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📅 Fecha Inicio
            </label>
            <input
              type="date"
              value={fechaInicio}
              max={getColombiaDate()}
              onChange={e => { setFechaInicio(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📅 Fecha Fin
            </label>
            <input
              type="date"
              value={fechaFin}
              max={getColombiaDate()}
              onChange={e => { setFechaFin(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        {/* Botón para limpiar filtros */}
        {(searchFactura || searchCliente || fechaInicio || fechaFin) && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => {
                setSearchFactura("");
                setSearchCliente("");
                setFechaInicio("");
                setFechaFin("");
                setCurrentPage(1);
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              🗑️ Limpiar Filtros
            </button>
          </div>
        )}
        
        {/* Mostrar resumen de filtros activos */}
        <div className="mt-3 text-sm text-gray-600">
          Mostrando <strong className="text-blue-600">{filteredInvoices.length}</strong> de <strong>{invoices.length}</strong> facturas
          {fechaInicio && fechaFin && (
            <span className="ml-2">
              (Desde <strong>{formatDateForDisplay(fechaInicio)}</strong> hasta <strong>{formatDateForDisplay(fechaFin)}</strong>)
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <>
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="py-2 px-4 border">Factura</th>
                <th className="py-2 px-4 border">Cliente</th>
                <th className="py-2 px-4 border">NIT Cliente</th>
                <th className="py-2 px-4 border">Total</th>
                <th className="py-2 px-4 border">Estado</th>
                <th className="py-2 px-4 border">Fecha</th>
                <th className="py-2 px-4 border">DIAN</th>
              </tr>
            </thead>
            <tbody>
              {paginatedInvoices.map((inv) => {
                const client = clients[inv.buyerId];
                const dianLink = getDianLink(inv.taxxaResponse);
                return (
                  <tr key={inv.id}>
                    <td className="py-2 px-4 border">{inv.invoiceNumber}</td>
                    <td className="py-2 px-4 border">
                      {client
                        ? `${client.first_name || ""} ${client.last_name || ""}`
                        : inv.buyerId}
                    </td>
                    <td className="py-2 px-4 border">{inv.buyerId}</td>
                    <td className="py-2 px-4 border">${parseFloat(inv.totalAmount).toLocaleString("es-CO")}</td>
                    <td className="py-2 px-4 border">{inv.status}</td>
                    <td className="py-2 px-4 border">{formatDateForDisplay(inv.createdAt, true)}</td>
                    <td className="py-2 px-4 border">
                      {dianLink ? (
                        <a
                          href={dianLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-pink-500 text-white px-3 py-1 rounded hover:bg-pink-700"
                        >
                          Ver DIAN
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Paginación */}
          <div className="flex justify-center mt-6">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="mx-1 px-2 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
            >
              {"<<"}
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="mx-1 px-2 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
            >
              {"<"}
            </button>
            {getPageNumbers().map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`mx-1 px-2 py-1 rounded ${
                  currentPage === page
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="mx-1 px-2 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
            >
              {">"}
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="mx-1 px-2 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
            >
              {">>"}
            </button>
          </div>
          <div className="mt-2 text-sm text-gray-600 text-center">
            Mostrando {filteredInvoices.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} -{" "}
            {Math.min(currentPage * itemsPerPage, filteredInvoices.length)} de {filteredInvoices.length} facturas
          </div>
        </>
      )}
    </div>
  );
};

export default InvoicesList;