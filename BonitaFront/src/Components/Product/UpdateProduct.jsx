import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductById, updateProduct } from "../../Redux/Actions/actions";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Navbar2 from "../Navbar2";

const UpdateProduct = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const product = useSelector((state) => state.product);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    priceSell: 0,
    stock: 0,
    images: [],
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (product) {
      setFormData({
        marca: product.marca || "",
        description: product.description || "",
        price: product.price || 0,
        priceSell: product.priceSell || 0,
        stock: product.stock || 0,
        images: product.images || [],

        sizes: product.sizes || "",
        colors: product.colors || "",
      });
    }
  }, [product]);

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateProduct(id, formData));
    Swal.fire({
      title: "Modificado",
      text: "Producto modificado exitosamente",
      icon: "success",
      confirmButtonText: "OK",
    });
    navigate("/");
  };

  return (
    <div className="min-h-screen  bg-gray-400 ">
      <Navbar2 />
      {/* Espaciado para el Navbar y el Footer */}
      <div className="container mx-auto px-4 py-8  rounded-lg shadow-md">
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg mt-16">
          <h1 className="text-2xl font-bold mb-4">Actualizar Producto</h1>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Marca
              </label>
              <input
                type="text"
                name="marca"
                value={formData.marca}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Descripción
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Precio
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Precio de Venta
              </label>
              <input
                type="number"
                name="priceSell"
                value={formData.priceSell}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Stock
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Talle
              </label>
              <input
                type="text"
                name="sizes"
                value={formData.sizes}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Color
              </label>
              <input
                type="text"
                name="colors"
                value={formData.colors}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            {formData.images && formData.images.length > 0 && (
              <div className="mt-4">
                <p className="block text-gray-700 text-sm font-bold mb-2">
                  Imágenes actuales
                </p>
                <div className="flex flex-wrap gap-2">
                  {formData.images.map((img, index) => (
                    <div key={index} className="relative">
                      <img
                        src={img}
                        alt={`Imagen ${index + 1}`}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-1 text-xs"
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Agrega otros campos de producto aquí */}
            <button
              type="submit"
              className="bg-colorBeige hover:bg-colorBeigeClaro text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Actualizar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateProduct;
