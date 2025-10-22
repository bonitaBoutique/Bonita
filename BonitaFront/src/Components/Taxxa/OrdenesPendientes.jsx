import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllOrders,
  fetchOrdersByIdOrder,
  deleteOrderDetail,
} from "../../Redux/Actions/actions";
import Swal from "sweetalert2";
import BillingFormModal from "./BillingFormModal";

const OrdenesPendientes = ({ filterType, mode, onSelectOrder }) => {
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const dispatch = useDispatch();
  
  // ✅ CORREGIR: Selector con verificación segura
  const { orders, loading, error } = useSelector((state) => {
    console.log('🔍 [OrdenesPendientes SELECTOR] State completo:', state);
    console.log('🔍 [OrdenesPendientes SELECTOR] State.ordersGeneral:', state.ordersGeneral);
    
    return {
      orders: state.ordersGeneral?.orders || state.ordersGeneral?.list || [],
      loading: state.ordersGeneral?.loading || false,
      error: state.ordersGeneral?.error || null
    };
  });

  const [hoveredOrderId, setHoveredOrderId] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [currentOrderDetail, setCurrentOrderDetail] = useState(null);

  // ✅ AGREGAR: Log para debugging
  console.log('🔍 [OrdenesPendientes COMPONENT] Orders data:', {
    orders,
    loading,
    error,
    count: orders?.length,
    filterType,
    mode
  });

  useEffect(() => {
    const loadOrders = async () => {
      try {
        console.log('🔵 [OrdenesPendientes] Cargando órdenes...');
        await dispatch(fetchAllOrders());
      } catch (error) {
        console.error('❌ [OrdenesPendientes] Error cargando órdenes:', error);
      }
    };

    loadOrders();
  }, [dispatch]);

  const handleSelectOrder = (orderId) => {
    if (onSelectOrder) {
      onSelectOrder(orderId);
    }
  };

  // ✅ NUEVA FUNCIÓN: Abrir modal de facturación
  const handleOpenBillingModal = (order) => {
    console.log('📋 [OrdenesPendientes] Abriendo modal de facturación para orden:', order);
    setSelectedOrder(order);
    setShowBillingModal(true);
  };

  const handleCloseBillingModal = () => {
    setShowBillingModal(false);
    setSelectedOrder(null);
  };

  const handleMouseEnter = async (id_orderDetail, event) => {
    try {
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left,
        y: rect.bottom + window.scrollY + 5,
      });
      setHoveredOrderId(id_orderDetail);
      setCurrentOrderDetail(null);

      const result = await dispatch(fetchOrdersByIdOrder(id_orderDetail));
      console.log("Fetched order details for tooltip:", result);

      if (result) {
        setCurrentOrderDetail(result);
      } else {
        // ✅ VERIFICAR que orders sea un array antes de usar find
        const existingOrder = Array.isArray(orders) 
          ? orders.find((o) => o.id_orderDetail === id_orderDetail)
          : null;
        setCurrentOrderDetail(existingOrder || null);
      }
    } catch (error) {
      console.error("Error en handleMouseEnter:", error);
      setCurrentOrderDetail(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredOrderId(null);
    setCurrentOrderDetail(null);
  };

  const handleDeleteOrder = async (id_orderDetail) => {
    // ✅ BUSCAR LA ORDEN PARA VERIFICAR SI TIENE RECIBO
    const order = Array.isArray(orders) 
      ? orders.find((o) => o.id_orderDetail === id_orderDetail)
      : null;

    const hasReceipt = order && order.receipt_info;

    // ✅ MENSAJE DIFERENTE SI TIENE RECIBO
    const alertText = hasReceipt
      ? `⚠️ ATENCIÓN: Esta orden tiene un recibo asociado (#${order.receipt_info.id_receipt}).

📄 Detalles del recibo:
• Método de pago: ${order.receipt_info.payMethod}
• Monto: $${order.receipt_info.total_amount?.toLocaleString('es-CO')}

🗑️ Si eliminas esta orden, también se eliminará el recibo de manera permanente.

¿Deseas continuar?`
      : `Esta acción borrará la orden N° ${id_orderDetail} definitivamente. ¡No podrás revertir esto!`;

    const result = await Swal.fire({
      title: hasReceipt ? "⚠️ Orden con Recibo Asociado" : "¿Estás seguro?",
      text: alertText,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: hasReceipt ? "Sí, borrar orden y recibo" : "Sí, ¡bórrala!",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await dispatch(deleteOrderDetail(id_orderDetail));
        
        const successMessage = hasReceipt
          ? `La orden N° ${id_orderDetail} y su recibo #${order.receipt_info.id_receipt} han sido eliminados.`
          : `La orden N° ${id_orderDetail} ha sido eliminada.`;

        Swal.fire({
          title: "¡Borrada!",
          text: successMessage,
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
        // ✅ Refrescar la lista después de eliminar
        dispatch(fetchAllOrders());
      } catch (deleteError) {
        console.error("Error al borrar la orden:", deleteError);
        Swal.fire(
          "Error",
          deleteError.message || "No se pudo borrar la orden. Por favor, inténtalo de nuevo.",
          "error"
        );
      }
    }
  };

  // ✅ ESTADOS DE CARGA Y ERROR MEJORADOS
  if (loading) {
    return (
      <div className="bg-colorFooter relative">
        <div className="container mx-auto px-4 py-8 mt-10">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-800 font-monserrat">Cargando órdenes...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-colorFooter relative">
        <div className="container mx-auto px-4 py-8 mt-10">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-800 mb-2">
              ❌ Error al cargar órdenes
            </h3>
            <p className="text-red-600 mb-4">
              {typeof error === "string" ? error : "Error desconocido"}
            </p>
            <button
              onClick={() => dispatch(fetchAllOrders())}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition duration-200"
            >
              🔄 Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ VERIFICAR que orders sea un array antes de procesar
  if (!Array.isArray(orders) || orders.length === 0) {
    return (
      <div className="bg-colorFooter relative">
        <div className="container mx-auto px-4 py-8 mt-10">
          <h2 className="text-2xl font-semibold mb-4 font-monserrat text-gray-900 bg-white p-2 rounded">
            Lista de Pedidos
          </h2>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No hay órdenes disponibles
            </h3>
            <p className="text-gray-600">
              No se encontraron órdenes para mostrar.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ FILTRADO SEGURO con verificación de array
  let filteredOrders = Array.isArray(orders) ? orders : [];
  
  if (filterType === "facturablesPendientes") {
    filteredOrders = filteredOrders.filter(
      (order) =>
        order?.isFacturable && 
        order?.status?.trim().toLowerCase() === "pendiente"
    );
  }

  console.log('🔍 [OrdenesPendientes] Filtered orders:', {
    originalCount: orders?.length || 0,
    filteredCount: filteredOrders?.length || 0,
    filterType
  });

  const renderActions = (order) => {
    return (
      <div className="flex space-x-2">
        {/* ✅ BOTÓN PRINCIPAL: Facturar (para órdenes facturables pendientes) */}
        {filterType === "facturablesPendientes" && (
          <button
            onClick={() => handleOpenBillingModal(order)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm font-medium flex items-center gap-1 transition-colors"
            title="Abrir formulario de facturación"
          >
            📝 Facturar
          </button>
        )}
        
        {/* Botones antiguos (solo si está en modo billingForm o invoice) */}
        {mode === "billingForm" && (
          <button
            onClick={() => handleSelectOrder(order.n_document)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
          >
            Doc
          </button>
        )}
        {mode === "invoice" && (
          <button
            onClick={() => handleSelectOrder(order.id_orderDetail)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
          >
            Orden
          </button>
        )}
        
        <button
          onClick={() => handleDeleteOrder(order.id_orderDetail)}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
          title="Borrar Orden"
        >
          Borrar
        </button>
      </div>
    );
  };

  return (
    <div className="bg-colorFooter relative">
      <div className="container mx-auto px-4 py-8 mt-10">
        <h2 className="text-2xl font-semibold mb-4 font-monserrat text-gray-900 bg-white p-2 rounded">
          Lista de Pedidos
        </h2>

        {/* ✅ Indicador de estado de datos */}
        <div className="mb-4 p-2 bg-blue-50 rounded-lg border-l-4 border-blue-400">
          <p className="text-xs text-blue-600">
            📊 Órdenes cargadas: {orders?.length || 0} | 
            🔍 Filtradas: {filteredOrders?.length || 0} |
            🏷️ Filtro: {filterType || 'ninguno'} |
            🔄 Estado: {loading ? 'Cargando...' : 'Listo'}
          </p>
        </div>

        <div
          className="overflow-x-auto shadow-md sm:rounded-lg"
          style={{ maxHeight: "500px" }}
        >
          <table className="min-w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-500">
              <tr>
                <th scope="col" className="px-6 py-3">
                  N° Pedido
                </th>
                <th scope="col" className="px-6 py-3">
                  Fecha
                </th>
                <th scope="col" className="px-6 py-3">
                  Cantidad
                </th>
                <th scope="col" className="px-6 py-3">
                  Monto
                </th>
                <th scope="col" className="px-6 py-3 bg-blue-100">
                  Importe Facturado
                </th>
                <th scope="col" className="px-6 py-3">
                  Documento Cliente
                </th>
                <th scope="col" className="px-6 py-3">
                  Punto de Venta
                </th>
                <th scope="col" className="px-6 py-3">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {/* ✅ VERIFICAR que filteredOrders sea un array y tenga elementos */}
              {Array.isArray(filteredOrders) && filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  // ✅ Verificación segura de order
                  if (!order || !order.id_orderDetail) {
                    console.warn('⚠️ [OrdenesPendientes] Orden inválida:', order);
                    return null;
                  }

                  return (
                    <tr
                      key={order.id_orderDetail}
                      className="bg-white border-b text-black hover:bg-gray-100"
                      onMouseEnter={(event) =>
                        handleMouseEnter(order.id_orderDetail, event)
                      }
                      onMouseLeave={handleMouseLeave}
                    >
                      <td className="px-6 py-4 font-medium text-black">
                        {order.id_orderDetail}
                        {order.user_info && (
                          <span className="block text-xs text-gray-600">
                            {order.user_info.first_name} {order.user_info.last_name}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">{order.date || 'N/A'}</td>
                      <td className="px-6 py-4">{order.quantity || 0}</td>
                      <td className="px-6 py-4">
                        ${order.amount?.toLocaleString("es-CO") || 0}
                      </td>
                      <td className="px-6 py-4 bg-blue-50 font-semibold">
                        {order.receipt_info?.total_amount ? (
                          <>
                            <span className="text-blue-700">
                              ${order.receipt_info.total_amount.toLocaleString("es-CO")}
                            </span>
                            {order.amount !== order.receipt_info.total_amount && (
                              <span className="block text-xs text-orange-600">
                                (Desc: ${(order.amount - order.receipt_info.total_amount).toLocaleString("es-CO")})
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-400 text-xs italic">Sin recibo</span>
                        )}
                      </td>
                      <td className="px-6 py-4">{order.n_document || 'N/A'}</td>
                      <td className="px-6 py-4">{order.pointOfSale || 'N/A'}</td>
                      <td className="px-6 py-4">{order.state_order || 'Sin estado'}</td>
                      <td className="px-6 py-4">{renderActions(order)}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="text-4xl mb-4">📦</div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {filterType === "facturablesPendientes" 
                        ? 'No hay órdenes facturables pendientes'
                        : 'No hay órdenes que coincidan con el filtro'}
                    </h3>
                    <p className="text-gray-600">
                      {filterType === "facturablesPendientes"
                        ? 'No se encontraron órdenes facturables con estado pendiente.'
                        : 'Intenta modificar los filtros de búsqueda.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ TOOLTIP con verificación segura */}
      {hoveredOrderId && currentOrderDetail && (
        <div
          className="absolute bg-gray-800 text-white p-4 rounded shadow-lg z-50 max-w-xs text-xs"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            pointerEvents: "none",
          }}
        >
          <h4 className="font-bold mb-2 border-b pb-1">
            Detalle Pedido: {hoveredOrderId}
          </h4>
          {currentOrderDetail.userData ? (
            <p className="mb-1">
              Cliente: {currentOrderDetail.userData.first_name || ''}{" "}
              {currentOrderDetail.userData.last_name || ''} (
              {currentOrderDetail.n_document || 'N/A'})
            </p>
          ) : (
            <p className="mb-1">Cliente: (No disponible)</p>
          )}
          <h5 className="font-semibold mt-2 mb-1">Productos:</h5>
          {currentOrderDetail.products && Array.isArray(currentOrderDetail.products) && currentOrderDetail.products.length > 0 ? (
            <ul className="list-disc list-inside space-y-1">
              {currentOrderDetail.products.map((product, index) => (
                <li key={index}>
                  {product.description || 'Sin descripción'} (Cod: {product.codigoBarra || 'N/A'})
                </li>
              ))}
            </ul>
          ) : (
            <p>No hay detalles de productos.</p>
          )}
          {!currentOrderDetail.products && !currentOrderDetail.user_info && (
            <p>Cargando detalles...</p>
          )}  
        </div>
      )}

      {/* ✅ MODAL DE FACTURACIÓN */}
      <BillingFormModal
        isOpen={showBillingModal}
        onClose={handleCloseBillingModal}
        orderData={selectedOrder}
      />
    </div>
  );
};

export default OrdenesPendientes;