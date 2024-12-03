import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductById, addToCart } from "../../Redux/Actions/actions";
import { useParams, useNavigate } from "react-router-dom";
import { FiShoppingCart } from "react-icons/fi";

const ProductDetails = () => {
  const { id } = useParams();

  console.log("useParams:", useParams());
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Obtener producto desde Redux
  const product = useSelector((state) => state.product);
  console.log(product);
  const loading = useSelector((state) => state.loading);
  const error = useSelector((state) => state.error);

  useEffect(() => {
    console.log("Producto ID recibido:", id); // Verifica si llega el id.
    if (id) {
      dispatch(fetchProductById(id));
    }
  }, [dispatch, id]);

  const handleAddToCart = () => {
    if (product) {
      dispatch(addToCart(product));
      navigate("/cart");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!product) return <p>No se encontró el producto.</p>;

  return (
    <div className="full min-h-screen mb-36 bg-gray-900">
      <div className="relative min-h-screen flex items-center justify-center pt-8 z-10">
        <div className="bg-gray-100 rounded-lg shadow-lg p-6 lg:p-8 w-full max-w-6xl flex flex-col">
          <div className="flex flex-col lg:flex-row">
            <div className="w-full lg:w-1/2 p-4 flex flex-col"></div>

            {product.images &&
              product.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Producto ${index}`}
                  className="w-full md:w-3/4 lg:w-1/2 h-auto rounded-lg mx-auto" // Ajustamos el tamaño aquí
                />
              ))}
            <div className="w-50% lg:w-1/2 p-4">
              <h2 className="text-3xl font-bold text-gray-800 mb-2 uppercase">
                {product.description}
              </h2>
              <p className="text-lg text-gray-500 mb-4">
                Marca: {product.marca}
              </p>
              <p className="text-lg text-gray-500 mb-4">
                Color: {product.colors}
              </p>
              <p className="text-xl font-semibold text-gray-800">
                Precio: ${product.price}
              </p>

              <button
                className="mt-4 bg-gray-800 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition"
                onClick={handleAddToCart}
              >
                <FiShoppingCart className="inline-block mr-2" />
                Agregar al carrito
              </button>
            </div>
          </div>

          {/* Productos relacionados */}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
