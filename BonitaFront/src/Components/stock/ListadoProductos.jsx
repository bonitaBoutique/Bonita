import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, updateProduct, deleteProduct } from "../../Redux/Actions/actions"; // Ajusta la ruta según tu estructura

const ListadoProductos = () => {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products || []);
  const loading = useSelector((state) => state.loading);
  const error = useSelector((state) => state.error);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleFiltroChange = (e) => {
    setFiltro(e.target.value.toLowerCase());
  };

  const toggleTiendaOnline = (producto) => {
    // Crear el objeto actualizado con el valor invertido de tiendaOnLine
    const updatedProduct = { ...producto, tiendaOnLine: !producto.tiendaOnLine };
  
    // Despachar la acción para actualizar el producto en el backend
    dispatch(updateProduct(producto.id_product, updatedProduct));
  
    // Opcionalmente actualizar el estado local para que el cambio sea visible de inmediato
  };
  

  const handleDeleteProduct = (id_product) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      dispatch(deleteProduct(id_product));
    }
  };

  const productosFiltrados = products.filter((producto) =>
    `${producto.codigoBarra} ${producto.marca} ${producto.codigoProv}`
      .toLowerCase()
      .includes(filtro)
  );

  if (loading) return <p className="text-center text-blue-500">Cargando productos...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <div className="p-6 mt-36">
      <input
        type="text"
        placeholder="Buscar por marca, código de barra o proveedor"
        className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg"
        onChange={handleFiltroChange}
      />

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              {[
                "Código Barra",
                "Marca",
                "Código Proveedor",
                "Descripción",
                "Costo",
                "Precio Venta",
                "Stock",
                "Tamaños",
                "Colores",
                "Tienda Online",
                "Acciones"
              ].map((header) => (
                <th
                  key={header}
                  className="px-4 py-2 border border-gray-300 text-left text-gray-600"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.map((producto) => (
              <tr key={producto.id_product} className="hover:bg-gray-50">
                <td className="px-4 py-2 border border-gray-300">{producto.codigoBarra}</td>
                <td className="px-4 py-2 border border-gray-300">{producto.marca}</td>
                <td className="px-4 py-2 border border-gray-300">{producto.codigoProv}</td>
                <td className="px-4 py-2 border border-gray-300">{producto.description}</td>
                <td className="px-4 py-2 border border-gray-300">${producto.price}</td>
                <td className="px-4 py-2 border border-gray-300">${producto.priceSell}</td>
                <td className="px-4 py-2 border border-gray-300">{producto.stock}</td>
                <td className="px-4 py-2 border border-gray-300">{producto.sizes}</td>
                <td className="px-4 py-2 border border-gray-300">{producto.colors}</td>
                <td className="px-4 py-2 border border-gray-300">
                  <button
                    onClick={() => toggleTiendaOnline(producto)}
                    className={`px-4 py-2 rounded-lg ${
                      producto.tiendaOnLine ? "bg-green-500 text-white" : "bg-gray-300 text-black"
                    }`}
                  >
                    {producto.tiendaOnLine ? "Activo" : "Inactivo"}
                  </button>
                </td>
                <td className="px-4 py-2 border border-gray-300">
                  <button
                    onClick={() => handleDeleteProduct(producto.id_product)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListadoProductos;


