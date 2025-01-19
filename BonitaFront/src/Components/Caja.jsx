import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchProducts,
  fetchFilteredProducts,
  createOrder,
} from "../Redux/Actions/actions";

const Caja = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.userTaxxa);

  const products = useSelector((state) => state.products || []);
  const loading = useSelector((state) => state.loading);
  const error = useSelector((state) => state.error);
  const searchTerm = useSelector((state) => state.searchTerm);

  const [selectedProducts, setSelectedProducts] = useState([]);
  
  const [orderData, setOrderData] = useState({
    date: new Date().toISOString(),
    amount: 0,
    quantity: 0,
    state_order: "Pedido Realizado",
    n_document: "",
    id_product: [],
    address: "Retira en local",
    deliveryAddress: null,
  });

  const [productCodes, setProductCodes] = useState(""); 
 

  const [nDocument, setNDocument] = useState(""); // Estado para el número de documento

  // Efecto para cargar productos según el filtro o búsqueda
  useEffect(() => {
    if (searchTerm) {
      dispatch(fetchFilteredProducts(searchTerm));
    } else {
      dispatch(fetchProducts());
    }
  }, [dispatch, searchTerm]);

  // Filtrar los productos disponibles (que tengan stock)
  const filteredProducts = products.filter((product) => product.stock > 0);

  // Manejar cambio de códigos de producto en el input
  const handleProductCodesChange = (e) => {
    const codes = e.target.value;
    setProductCodes(codes);
  };

  // Verificar stock y agregar productos seleccionados
  const handleAddProducts = () => {
    if (!productCodes) {
      alert("Por favor, ingresa al menos un código de producto.");
      return;
    }

    // Asegurarse de que productCodes sea una cadena de texto antes de usar split
    const codes = productCodes.trim().split(",").map(code => code.trim().toUpperCase());
    const productsToAdd = [];

    codes.forEach((id_product) => {
      const product = filteredProducts.find((p) => p.id_product === id_product); // Verifica que id_product sea el correcto
      if (product) {
        if (product.stock > 0) {
          // Solo agregar el producto si tiene stock disponible
          productsToAdd.push({ ...product, quantity: 1 }); // Agrega la cantidad inicial como 1
        } else {
          alert(`El producto con código ${id_product} no tiene stock disponible.`);
        }
      } else {
        alert(`No se encontró el producto con código ${id_product}.`);
      }
    });

    // Si hay productos para agregar, los agregamos al estado
    if (productsToAdd.length > 0) {
      setSelectedProducts((prevSelected) => [
        ...prevSelected,
        ...productsToAdd,
      ]);
    }

    setProductCodes(""); // Limpiar input después de agregar productos
  };

  // Actualizar la cantidad seleccionada de un producto
  const handleQuantityChange = (id_product, quantity) => {
    setSelectedProducts((prev) =>
      prev.map((item) =>
        item.id_product === id_product ? { ...item, quantity: quantity } : item
      )
    );
  };

  // Calcular el precio total y la cantidad total de los productos seleccionados
  const calculateTotals = () => {
    const totalPrice = selectedProducts.reduce(
      (acc, item) => acc + item.priceSell * item.quantity, // Multiplicar priceSell por quantity
      0
    );
    const totalQuantity = selectedProducts.reduce(
      (acc, item) => acc + item.quantity,
      0
    );
    return { totalPrice, totalQuantity };
  };

  const handleDocumentChange = (e) => {
    const value = e.target.value;
    setNDocument(value);
    console.log("Document entered:", value);
    console.log("UserInfo data:", userInfo?.data);
  };
  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!nDocument) {
      alert("Por favor, ingresa el número de documento.");
      return;
    }
 
  
    const { totalPrice, totalQuantity } = calculateTotals();
  
    const orderDataToSend = {
      date: new Date().toISOString(),
      amount: totalPrice,
      quantity: totalQuantity,
      state_order: "Pedido Realizado",
      n_document: nDocument,
      id_product: selectedProducts.map((item) => item.id_product),
      address: orderData.address,
      deliveryAddress: orderData.deliveryAddress,
    };
  
    try {
      const orderDetail = await dispatch(createOrder(orderDataToSend));
      const idOrder = orderDetail.id_orderDetail; // Usa el id de la orden creada
  
      console.log("ID de la orden creada:", idOrder);
  
      navigate(`/receipt/${idOrder}`); // Redirige al recibo
    } catch (error) {
      console.error("Error al crear la orden:", error.message);
      alert("No se pudo crear la orden. Inténtalo de nuevo.");
    }
  };
  
  
  

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Cargando...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Error: {error}
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-colorBeige py-16">
        <p className="text-white text-lg">No hay productos disponibles.</p>
      </div>
    );
  }

  return (
    <div className="p-6 pt-16 bg-white rounded-lg shadow-md">
    <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-300"
      >
        ← Volver
      </button>
      <h2 className="text-2xl font-semibold mb-6">Seleccionar Productos</h2>

      {/* Input para los códigos de productos */}
      <div className="mb-4">
        <input
          type="text"
          value={productCodes}
          onChange={handleProductCodesChange}
          placeholder="Ingresa los códigos de los productos separados por coma"
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleAddProducts}
          className="mt-2 w-full p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
        >
          Agregar Productos
        </button>
      </div>

      {/* Mostrar productos seleccionados */}
      {selectedProducts.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-medium mb-4">Productos Seleccionados</h3>
          {selectedProducts.map((product) => (
            <div
              key={product.id_product} // Usa id_product aquí
              className="flex items-center justify-between mb-4 p-4 bg-gray-100 rounded-lg shadow-sm"
            >
              <div className="flex items-center">
                <p className="mr-4 text-lg font-semibold">{product.description}</p>
                <p className="text-sm text-gray-500">Precio Unitario: ${product.priceSell}</p> {/* Mostrar el precio individual */}
              </div>
              <div>
                <input
                  type="number"
                  min="1"
                  value={product.quantity || 1}
                  onChange={(e) =>
                    handleQuantityChange(product.id_product, Number(e.target.value))
                  }
                  className="w-16 p-2 border border-gray-300 rounded-md text-center"
                />
                <p className="text-sm text-gray-500">Total: ${product.priceSell * (product.quantity || 1)}</p> {/* Mostrar el monto total */}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Input para el número de documento */}
      <div className="mb-4">
        <input
          type="text"
          id="n_document"
          value={nDocument}
          onChange={handleDocumentChange}
          placeholder="Ingresa el número de documento"
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
         {nDocument && (
        <>
          {userInfo?.data?.n_document === nDocument ? (
            <form onSubmit={handleSubmit}>
              <button
                type="submit"
                className="w-full p-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Confirmar Pedido
              </button>
            </form>
          ) : (
            <div className="mt-4">
              <p className="text-red-500 mb-2">Usuario no registrado</p>
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Registrar Usuario
              </button>
            </div>
          )}
        </>
      )}

       

     
    </div>
    </div>
  );
}






export default Caja;

 



