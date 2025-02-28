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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectAll, setSelectAll] = useState(false);

  const [selectedProducts, setSelectedProducts] = useState([]);

  const handleImageUpload = (productId) => {
    openCloudinaryWidget((uploadedImageUrl) => {
      if (uploadedImageUrl) {
        console.log("Imagen subida correctamente, URL:", uploadedImageUrl);
        dispatch(updateProduct(productId, { images: [uploadedImageUrl] }));
      } else {
        console.error("Error al subir la imagen.");
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

  const toggleTiendaOnline = async (producto) => {
    try {
      const updatedProduct = {
        ...producto,
        tiendaOnLine: !producto.tiendaOnLine,
      };
      await dispatch(updateProduct(producto.id_product, updatedProduct));
      // Recargar los productos después de la actualización
      dispatch(fetchProducts());
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
    }
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      setSelectedProducts(productosFiltrados.map(p => p.id_product));
    } else {
      setSelectedProducts([]);
    }
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = productosFiltrados.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(productosFiltrados.length / itemsPerPage);

  // Función para cambiar de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading)
    return <p className="text-center text-blue-500">Cargando productos...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <>
      <Navbar2 />
      <div className="p-6 mt-36">
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Buscar por marca, código de barra o proveedor"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
            onChange={handleFiltroChange}
          />
  
          <button
            onClick={handleDownloadExcel}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={selectedProducts.length === 0}
          >
            Descargar Excel
          </button>
        </div>
  
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                {[
                  "Imágenes",
                  "Seleccionar",
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
                  "Acciones",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-2 border border-gray-300 text-left text-gray-600"
                  >
                    {header}
                  </th>
                ))}
                <th className="px-4 py-2 border border-gray-300">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="form-checkbox h-5 w-5"
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((producto) => (
                <tr key={producto.id_product} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border border-gray-300">
                    {producto.image ? (
                      <div className="flex flex-col items-center gap-2">
                        <img
                          src={producto.image}
                          alt={producto.description}
                          className="w-20 h-20 object-cover"
                        />
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
                      onChange={() => toggleProductSelection(producto.id_product)}
                      className="form-checkbox h-5 w-5"
                    />
                  </td>
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
  
          {/* Paginación */}
          <div className="flex justify-center mt-8 w-full overflow-x-auto">
            <div className="flex space-x-1">
              <button
                onClick={() => paginate(1)}
                disabled={currentPage === 1}
                className="mx-1 px-2 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
              >
                {"<<"}
              </button>
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="mx-1 px-2 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
              >
                {"<"}
              </button>

              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => paginate(i + 1)}
                  className={`mx-1 px-2 py-1 rounded-md ${
                    currentPage === i + 1
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="mx-1 px-2 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
              >
                {">"}
              </button>
              <button
                onClick={() => paginate(totalPages)}
                disabled={currentPage === totalPages}
                className="mx-1 px-2 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
              >
                {">>"}
              </button>
            </div>
          </div>

          <div className="mt-2 text-sm text-gray-600">
            Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, productosFiltrados.length)} de {productosFiltrados.length} productos
          </div>
        </div>
      </div>
    </>
  );
};

export default ListadoProductos;
