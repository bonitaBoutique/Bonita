import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../Redux/Actions/actions'; // Ajusta la ruta según tu estructura

const ListadoProductos = () => {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products || []);
  console.log(products)
  const loading = useSelector((state) => state.loading);
  const error = useSelector((state) => state.error);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleFiltroChange = (e) => {
    setFiltro(e.target.value.toLowerCase());
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
                "Precio",
                "Stock",
                "Tamaños",
                "Colores",
                "Facturable (Dian)"
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
                <td className="px-4 py-2 border border-gray-300">{producto.stock}</td>
                <td className="px-4 py-2 border border-gray-300">{producto.sizes}</td>
                <td className="px-4 py-2 border border-gray-300">{producto.colors}</td>
                <td className="px-4 py-2 border border-gray-300">{producto.isDian ? 'Sí' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListadoProductos;
