import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAccountSummary } from "../../Redux/Actions/actions";
import { useParams } from "react-router-dom";

const AccountSummary = (props) => {
  const params = useParams();
  const n_document = props.n_document || params.n_document;

  const dispatch = useDispatch();
  const { loading, data, error } = useSelector((state) => state.accountSummary);

  // Estado para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (n_document) {
      dispatch(fetchAccountSummary(n_document));
    }
  }, [dispatch, n_document]);

  // Reiniciar página si cambian los datos
  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  if (loading) return <div className="text-center py-8">Cargando...</div>;
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>;
  if (!data) return null;

  const { user, orders = [], receipts = [], reservations = [], giftcards = [] } = data;

  // Combinar órdenes y recibos en un solo array
  const movimientos = [
    ...orders.map(order => ({
      tipo: "orden",
      fecha: order.createdAt || order.date,
      ...order,
    })),
    ...receipts.map(receipt => ({
      tipo: "recibo",
      fecha: receipt.createdAt || receipt.date,
      ...receipt,
    })),
  ].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)); // Orden descendente por fecha

  // Paginación
  const totalPages = Math.ceil(movimientos.length / itemsPerPage);
  const paginatedMovimientos = movimientos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Resumen de Cuenta</h2>
      <div className="mb-6">
        <h3 className="font-semibold">Cliente:</h3>
        <p>{user.first_name} {user.last_name} ({user.n_document})</p>
        <p>Email: {user.email}</p>
        <p>Teléfono: {user.phone}</p>
      </div>

      {/* Movimientos (Órdenes y Recibos) */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Movimientos (Órdenes y Recibos)</h3>
        {paginatedMovimientos.length > 0 ? (
          <>
            <table className="min-w-full bg-gray-50 border mb-4">
              <thead>
                <tr>
                  <th className="py-2 px-3 border">Fecha</th>
                  <th className="py-2 px-3 border">Tipo</th>
                  <th className="py-2 px-3 border">Monto</th>
                  <th className="py-2 px-3 border">Estado / Método</th>
                  <th className="py-2 px-3 border">Factura / Recibo</th>
                  <th className="py-2 px-3 border">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {paginatedMovimientos.map((mov, idx) => (
                  <tr key={mov.id_orderDetail || mov.id_receipt || idx}>
                    <td className="py-2 px-3 border">
                      {new Date(mov.fecha).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-3 border capitalize">
                      {mov.tipo}
                    </td>
                    <td className="py-2 px-3 border">
                      ${mov.amount?.toLocaleString("es-CO") || mov.total_amount?.toLocaleString("es-CO") || "-"}
                    </td>
                    <td className="py-2 px-3 border">
                      {mov.tipo === "orden"
                        ? mov.state_order
                        : mov.payMethod}
                    </td>
                    <td className="py-2 px-3 border">
                      {mov.tipo === "orden"
                        ? (mov.Invoice ? mov.Invoice.invoiceNumber : "-")
                        : mov.id_receipt}
                    </td>
                    <td className="py-2 px-3 border">
                      {mov.tipo === "orden"
                        ? `Orden #${mov.id_orderDetail}`
                        : `Recibo #${mov.id_receipt}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Controles de paginación */}
            <div className="flex justify-center gap-2 mt-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-2 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
              >
                {"<<"}
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
              >
                {"<"}
              </button>
              <span className="px-2 py-1">{currentPage} / {totalPages}</span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-2 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
              >
                {">"}
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-2 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
              >
                {">>"}
              </button>
            </div>
          </>
        ) : <p className="text-gray-500">Sin movimientos registrados.</p>}
      </div>

      {/* Reservas */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Reservas</h3>
        {reservations && reservations.length > 0 ? (
          <table className="min-w-full bg-gray-50 border mb-4">
            <thead>
              <tr>
                <th className="py-2 px-3 border">Fecha</th>
                <th className="py-2 px-3 border">Monto</th>
                <th className="py-2 px-3 border">Pagado</th>
                <th className="py-2 px-3 border">Pendiente</th>
                <th className="py-2 px-3 border">Pagos Parciales</th>
                <th className="py-2 px-3 border">Estado</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map(res => (
                <tr key={res.id_reservation}>
                  <td className="py-2 px-3 border">{new Date(res.createdAt).toLocaleDateString()}</td>
                  <td className="py-2 px-3 border">${res.partialPayment?.toLocaleString("es-CO")}</td>
                  <td className="py-2 px-3 border">${res.totalPaid?.toLocaleString("es-CO")}</td>
                  <td className="py-2 px-3 border">${(res.partialPayment - res.totalPaid)?.toLocaleString("es-CO")}</td>
                  <td className="py-2 px-3 border">
                    {res.CreditPayments && res.CreditPayments.length > 0
                      ? res.CreditPayments.map(p => (
                        <div key={p.id}>
                          {new Date(p.createdAt).toLocaleDateString()}: ${p.amount?.toLocaleString("es-CO")}
                        </div>
                      ))
                      : "-"}
                  </td>
                  <td className="py-2 px-3 border">{res.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="text-gray-500">Sin reservas registradas.</p>}
      </div>

      {/* Giftcards */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Giftcards</h3>
        {giftcards && giftcards.length > 0 ? (
          <table className="min-w-full bg-gray-50 border">
            <thead>
              <tr>
                <th className="py-2 px-3 border">ID</th>
                <th className="py-2 px-3 border">Saldo</th>
                <th className="py-2 px-3 border">Estado</th>
                <th className="py-2 px-3 border">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {giftcards.map(gc => (
                <tr key={gc.id_giftcard}>
                  <td className="py-2 px-3 border">{gc.id_giftcard}</td>
                  <td className="py-2 px-3 border">${gc.saldo?.toLocaleString("es-CO")}</td>
                  <td className="py-2 px-3 border">{gc.estado}</td>
                  <td className="py-2 px-3 border">{new Date(gc.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="text-gray-500">Sin giftcards registradas.</p>}
      </div>
    </div>
  );
};

export default AccountSummary;