import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchOrdersByDocument } from "../Redux/Actions/actions";

const OrdersDetails = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { n_document } = useParams();
  const orderDetails = useSelector((state) => state.orders);
  const { loading, error, orders } = orderDetails;



  useEffect(() => {
    
    dispatch(fetchOrdersByDocument(n_document));
  }, [dispatch, n_document]);

  useEffect(() => {
   
  }, [orderDetails]);

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate("/")}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        Volver
      </button>
      {orders.map((order, index) => (
        <div
          key={order.id_orderDetail}
          className={`bg-white shadow-md rounded-lg mb-4 ${
            index !== 0 ? "mt-8" : ""
          }`}
        >
          <div className="p-4">
            <p className="text-lg font-semibold">
              Pedido N°: {order.id_orderDetail}
            </p>
            <p className="text-gray-600">Fecha: {order.date}</p>
            <p className="mt-2">Total: ${order.amount}</p>
            <p>Cantidad: {order.quantity}</p>
            <p>Estado de pedido: {order.state_order}</p>
            <p>N° de envío: {order.trackingNumber}</p>
            <div className="mt-4">
              <h3 className="text-md font-semibold">Productos:</h3>
              {order.products.map((product) => (
                <div
                  key={product.id_product}
                  className="mt-2 flex items-center"
                >
                  <img
                    src={product.firstImage}
                    alt={product.description}
                    className="w-16 h-16 object-cover rounded-md mr-4"
                  />
                  <div>
                    <p className="text-gray-800">{product.description}</p>
                    <p className="text-gray-600">
                      Código de Barra: {product.codigoBarra}
                    </p>
                  </div>
                  {order.images && order.images.length > 0 && (
              <div className="mt-4">
                <h3 className="text-md font-semibold">Imágenes de la Orden:</h3>
                <div className="flex flex-wrap gap-2 mt-2"> {/* Contenedor para mostrar imágenes */}
                  {order.images.map((imageUrl, imgIndex) => (
                    <img
                      key={imgIndex} // Usa el índice como key si las URLs son únicas
                      src={imageUrl}
                      alt={`Imagen de la orden ${order.id_orderDetail} - ${imgIndex + 1}`}
                      className="w-24 h-24 object-cover rounded-md border" // Ajusta tamaño y estilo
                      onError={(e) => { e.target.style.display = 'none'; }} // Opcional: Oculta si la imagen falla al cargar
                    />
                  ))}
                </div>
              </div>
            )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrdersDetails;
