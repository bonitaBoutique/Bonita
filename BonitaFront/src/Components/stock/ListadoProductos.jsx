import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProducts,
  updateProduct,
  deleteProduct,
  fetchProductStock,
} from "../../Redux/Actions/actions";
import Navbar2 from "../Navbar2";
import { openCloudinaryWidget } from "../../cloudinaryConfig";

const ListadoProductos = () => {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products || []);
  const loading = useSelector((state) => state.loading);
  const error = useSelector((state) => state.error);

  const [editRowId, setEditRowId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Filtro de productos
  const productosFiltrados = products.filter((producto) =>
    `${producto.codigoBarra} ${producto.marca} ${producto.codigoProv} ${producto.description}`
      .toLowerCase()
      .includes(filtro.toLowerCase())
  );

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = productosFiltrados.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(productosFiltrados.length / itemsPerPage);

  // Editar producto
  const handleEditClick = (producto) => {
    setEditRowId(producto.id_product);
    setEditForm({ ...producto });
    dispatch(fetchProductStock(producto.id_product));
  };

  const handleEditChange = (e) => {
    const { name, value, type } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSave = async (id) => {
    await dispatch(updateProduct(id, editForm));
    setEditRowId(null);
  };

  const handleCancel = () => {
    setEditRowId(null);
  };

  // Eliminar producto
  const handleDeleteProduct = (id_product) => {
    if (window.confirm("¿Eliminar este producto?")) {
      dispatch(deleteProduct(id_product));
    }
  };

  // Imagenes
  const handleImageUpload = (productId) => {
    openCloudinaryWidget((uploadedImageUrl) => {
      if (uploadedImageUrl) {
        const productToUpdate = products.find((p) => p.id_product === productId);
        const newImages = productToUpdate?.images
          ? [...productToUpdate.images, uploadedImageUrl]
          : [uploadedImageUrl];
        dispatch(updateProduct(productId, { images: newImages }));
      }
    });
  };

  const handleDeleteImage = (productId, imageUrl) => {
    const productToUpdate = products.find((p) => p.id_product === productId);
    if (!productToUpdate?.images) return;
    const newImages = productToUpdate.images.filter((img) => img !== imageUrl);
    dispatch(updateProduct(productId, { images: newImages }));
  };

  // Tienda Online toggle
  const toggleTiendaOnline = async (producto) => {
    const updatedProduct = {
      ...producto,
      tiendaOnLine: !producto.tiendaOnLine,
    };
    await dispatch(updateProduct(producto.id_product, updatedProduct));
  };

  // Render
  return (
    <>
      <Navbar2 />
      <div className="max-w-7xl mx-auto p-6 mt-36">
        <div className="flex gap-4 mb-6 items-center">
          <input
            type="text"
            placeholder="Buscar por marca, código de barra, proveedor o descripción"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>

        {loading && (
          <div className="text-center text-blue-500 font-semibold py-8">
            Cargando productos...
          </div>
        )}
        {error && (
          <div className="text-center text-red-500 font-semibold py-8">
            Error: {error}
          </div>
        )}

        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full table-auto border border-gray-200 bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">Imágenes</th>
                <th className="px-4 py-2 border">Código Barra</th>
                <th className="px-4 py-2 border">Marca</th>
                <th className="px-4 py-2 border">Código Proveedor</th>
                <th className="px-4 py-2 border">Descripción</th>
                <th className="px-4 py-2 border">Costo</th>
                <th className="px-4 py-2 border">Precio Venta</th>
                <th className="px-4 py-2 border">Tamaños</th>
                <th className="px-4 py-2 border">Colores</th>
                <th className="px-4 py-2 border">Tienda Online</th>
                <th className="px-4 py-2 border">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((producto) => (
                <tr key={producto.id_product} className="hover:bg-gray-50">
                  {/* Imágenes */}
                  <td className="px-4 py-2 border">
                    <div className="flex flex-wrap gap-2 items-center">
                      {producto.images?.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={img}
                            alt={producto.description}
                            className="w-16 h-16 object-cover rounded border"
                          />
                          <button
                            onClick={() => handleDeleteImage(producto.id_product, img)}
                            className="absolute top-0 right-0 bg-red-600 text-white text-xs px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition"
                            title="Eliminar imagen"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => handleImageUpload(producto.id_product)}
                        className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                      >
                        + Imagen
                      </button>
                    </div>
                  </td>
                  {/* Código Barra */}
                  <td className="px-4 py-2 border">
                    {editRowId === producto.id_product ? (
                      <input
                        name="codigoBarra"
                        value={editForm.codigoBarra || ""}
                        onChange={handleEditChange}
                        className="w-24 px-2 py-1 border rounded"
                      />
                    ) : (
                      producto.codigoBarra
                    )}
                  </td>
                  {/* Marca */}
                  <td className="px-4 py-2 border">
                    {editRowId === producto.id_product ? (
                      <input
                        name="marca"
                        value={editForm.marca || ""}
                        onChange={handleEditChange}
                        className="w-24 px-2 py-1 border rounded"
                      />
                    ) : (
                      producto.marca
                    )}
                  </td>
                  {/* Código Proveedor */}
                  <td className="px-4 py-2 border">
                    {editRowId === producto.id_product ? (
                      <input
                        name="codigoProv"
                        value={editForm.codigoProv || ""}
                        onChange={handleEditChange}
                        className="w-24 px-2 py-1 border rounded"
                      />
                    ) : (
                      producto.codigoProv
                    )}
                  </td>
                  {/* Descripción */}
                  <td className="px-4 py-2 border">
                    {editRowId === producto.id_product ? (
                      <input
                        name="description"
                        value={editForm.description || ""}
                        onChange={handleEditChange}
                        className="w-32 px-2 py-1 border rounded"
                      />
                    ) : (
                      producto.description
                    )}
                  </td>
                  {/* Costo */}
                  <td className="px-4 py-2 border">
                    {editRowId === producto.id_product ? (
                      <input
                        name="price"
                        type="number"
                        value={editForm.price || ""}
                        onChange={handleEditChange}
                        className="w-20 px-2 py-1 border rounded"
                        min={0}
                      />
                    ) : (
                      producto.price
                    )}
                  </td>
                  {/* Precio Venta */}
                  <td className="px-4 py-2 border">
                    {editRowId === producto.id_product ? (
                      <input
                        name="priceSell"
                        type="number"
                        value={editForm.priceSell || ""}
                        onChange={handleEditChange}
                        className="w-20 px-2 py-1 border rounded"
                        min={0}
                      />
                    ) : (
                      producto.priceSell
                    )}
                  </td>
                  {/* Tamaños */}
                  <td className="px-4 py-2 border">
                    {editRowId === producto.id_product ? (
                      <input
                        name="sizes"
                        value={editForm.sizes || ""}
                        onChange={handleEditChange}
                        className="w-24 px-2 py-1 border rounded"
                      />
                    ) : (
                      producto.sizes
                    )}
                  </td>
                  {/* Colores */}
                  <td className="px-4 py-2 border">
                    {editRowId === producto.id_product ? (
                      <input
                        name="colors"
                        value={editForm.colors || ""}
                        onChange={handleEditChange}
                        className="w-24 px-2 py-1 border rounded"
                      />
                    ) : (
                      producto.colors
                    )}
                  </td>
                  {/* Tienda Online */}
                  <td className="px-4 py-2 border">
                    {editRowId === producto.id_product ? (
                      <select
                        name="tiendaOnLine"
                        value={editForm.tiendaOnLine ? "true" : "false"}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            tiendaOnLine: e.target.value === "true",
                          }))
                        }
                        className="w-24 px-2 py-1 border rounded"
                      >
                        <option value="true">Activo</option>
                        <option value="false">Inactivo</option>
                      </select>
                    ) : (
                      <button
                        onClick={() => toggleTiendaOnline(producto)}
                        className={`px-4 py-1 rounded-lg text-xs ${
                          producto.tiendaOnLine
                            ? "bg-green-500 text-white"
                            : "bg-gray-300 text-black"
                        }`}
                      >
                        {producto.tiendaOnLine ? "Activo" : "Inactivo"}
                      </button>
                    )}
                  </td>
                  {/* Acciones */}
                  <td className="px-4 py-2 border">
                    {editRowId === producto.id_product ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSave(producto.id_product)}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={handleCancel}
                          className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(producto)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(producto.id_product)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          Eliminar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex justify-center mt-8 w-full">
          <div className="flex space-x-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="mx-1 px-2 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
            >
              {"<<"}
            </button>
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="mx-1 px-2 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
            >
              {"<"}
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`mx-1 px-2 py-1 rounded ${
                  currentPage === i + 1
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="mx-1 px-2 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
            >
              {">"}
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="mx-1 px-2 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
            >
              {">>"}
            </button>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600 text-center">
          Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, productosFiltrados.length)} de {productosFiltrados.length} productos
        </div>
      </div>
    </>
  );
};

export default ListadoProductos;