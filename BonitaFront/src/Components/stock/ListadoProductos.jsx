import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProducts,
  updateProduct,
  deleteProduct,
} from "../../Redux/Actions/actions"; // Ajusta la ruta según tu estructura
import * as XLSX from "xlsx"; // Importar SheetJS
import Navbar2 from "../Navbar2";
import { openCloudinaryWidget } from "../../cloudinaryConfig";

const ListadoProductos = () => {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products || []);
  const loading = useSelector((state) => state.loading);
  const error = useSelector((state) => state.error);
  const [filtro, setFiltro] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);

  const handleImageUpload = (productId) => {
    // eslint-disable-next-line no-undef
    openCloudinaryWidget((error, result) => {
      if (!error && result && result.event === "success") {
        dispatch(updateProduct(productId, { image: result.info.url }));
      }
    });
  };

  const handleDeleteImage = (productId) => {
    dispatch(updateProduct(productId, { image: null }));
  };

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleFiltroChange = (e) => {
    setFiltro(e.target.value.toLowerCase());
  };

  const toggleProductSelection = (productId) => {
    setSelectedProducts((prevSelected) =>
      prevSelected.includes(productId)
        ? prevSelected.filter((id) => id !== productId)
        : [...prevSelected, productId]
    );
  };

  const toggleTiendaOnline = (producto) => {
    const updatedProduct = {
      ...producto,
      tiendaOnLine: !producto.tiendaOnLine,
    };
    dispatch(updateProduct(producto.id_product, updatedProduct));
  };

  const handleDeleteProduct = (id_product) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      dispatch(deleteProduct(id_product));
    }
  };

  const handleDownloadExcel = () => {
    const selectedData = products.filter((producto) =>
      selectedProducts.includes(producto.id_product)
    );

    const dataForExcel = selectedData.map((producto) => ({
      Código_Barra: producto.codigoBarra,
      Marca: producto.marca,
      Código_Proveedor: producto.codigoProv,
      Descripción: producto.description,
      Costo: producto.price,
      Precio_Venta: producto.priceSell,
      Stock: producto.stock,
      Tamaños: producto.sizes,
      Colores: producto.colors,
      Tienda_Online: producto.tiendaOnLine ? "Sí" : "No",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");
    XLSX.writeFile(workbook, "productos_seleccionados.xlsx");
  };

  const productosFiltrados = products.filter((producto) =>
    `${producto.codigoBarra} ${producto.marca} ${producto.codigoProv}`
      .toLowerCase()
      .includes(filtro)
  );

  if (loading)
    return <p className="text-center text-blue-500">Cargando productos...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <>
      <Navbar2 />
      <div className="p-6 mt-36">
        <input
          type="text"
          placeholder="Buscar por marca, código de barra o proveedor"
          className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg"
          onChange={handleFiltroChange}
        />

        <button
          onClick={handleDownloadExcel}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
          disabled={selectedProducts.length === 0}
        >
          Descargar Excel
        </button>

        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border border-gray-300 text-left text-gray-600">
                  Seleccionar
                </th>
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
                  "Imágenes",
                  "Tienda Online",
                  "Acciones",
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
                <td className="px-4 py-2 border border-gray-300">
            {producto.image ? (
              <div className="flex flex-col items-center gap-2">
                <img src={producto.image} alt={producto.description} className="w-20 h-20 object-cover" />
                <button
                  onClick={() => handleImageUpload(producto.id_product)}
                  className="px-2 py-1 bg-blue-500 text-white text-sm rounded"
                >
                  Modificar
                </button>
                <button
                  onClick={() => handleDeleteImage(producto.id_product)}
                  className="px-2 py-1 bg-red-500 text-white text-sm rounded"
                >
                  Eliminar
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleImageUpload(producto.id_product)}
                className="px-4 py-2 bg-green-500 text-white rounded"
              >
                Agregar Imagen
              </button>
            )}
          </td>
                  <td className="px-4 py-2 border border-gray-300">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(producto.id_product)}
                      onChange={() =>
                        toggleProductSelection(producto.id_product)
                      }
                    />
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    {producto.codigoBarra}
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    {producto.marca}
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    {producto.codigoProv}
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    {producto.description}
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    ${producto.price}
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    ${producto.priceSell}
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    {producto.stock}
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    {producto.sizes}
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    {producto.colors}
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    <button
                      onClick={() => toggleTiendaOnline(producto)}
                      className={`px-4 py-2 rounded-lg ${
                        producto.tiendaOnLine
                          ? "bg-green-500 text-white"
                          : "bg-gray-300 text-black"
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
    </>
  );
};

export default ListadoProductos;
