import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../Config";


const InvoicesList = () => {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/invoice/allInvoices`);
        setInvoices(res.data.invoices || []);
        // Obtener todos los buyerId únicos
        const buyerIds = [...new Set((res.data.invoices || []).map(inv => inv.buyerId))];
        // Buscar datos de clientes (puedes optimizar esto según tu backend)
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

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-gray-100 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Listado de Facturas</h2>
      {loading ? (
        <p>Cargando...</p>
      ) : (
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
            {invoices.map((inv) => {
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
      )}
    </div>
  );
};

export default InvoicesList;