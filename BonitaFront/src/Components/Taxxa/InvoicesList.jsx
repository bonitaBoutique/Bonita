import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../Config";


const InvoicesList = () => {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState({});
  const [loading, setLoading] = useState(true);

  const [searchFactura, setSearchFactura] = useState("");
  const [searchCliente, setSearchCliente] = useState("");
  const [searchFecha, setSearchFecha] = useState("");
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

  const getDianLink = (sqr) => {
    if (!sqr) return null;
    const match = sqr.match(/https:\/\/catalogo-vpfe\.dian\.gov\.co\/document\/searchqr\?documentkey=[a-zA-Z0-9]+/);
    return match ? match[0] : null;
  };

  const filteredInvoices = invoices.filter((inv) => {
    const client = clients[inv.buyerId];
    const clienteNombre = client ? `${client.first_name || ""} ${client.last_name || ""}` : "";
    const fecha = new Date(inv.createdAt).toISOString().split("T")[0];
    return (
      (!searchFactura || inv.invoiceNumber.toLowerCase().includes(searchFactura.toLowerCase())) &&
      (!searchCliente || clienteNombre.toLowerCase().includes(searchCliente.toLowerCase())) &&
      (!searchFecha || fecha === searchFecha)
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
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="text"
          placeholder="Buscar por número de factura"
          value={searchFactura}
          onChange={e => { setSearchFactura(e.target.value); setCurrentPage(1); }}
          className="px-3 py-2 border rounded"
        />
        <input
          type="text"
          placeholder="Buscar por cliente"
          value={searchCliente}
          onChange={e => { setSearchCliente(e.target.value); setCurrentPage(1); }}
          className="px-3 py-2 border rounded"
        />
        <input
          type="date"
          placeholder="Buscar por fecha"
          value={searchFecha}
          onChange={e => { setSearchFecha(e.target.value); setCurrentPage(1); }}
          className="px-3 py-2 border rounded"
        />
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
                const dianLink = getDianLink(inv.taxxaResponse?.jret?.sqr);
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
                    <td className="py-2 px-4 border">{new Date(inv.createdAt).toLocaleString()}</td>
                    <td className="py-2 px-4 border">
                      {dianLink ? (
                        <a
                          href={dianLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-700"
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