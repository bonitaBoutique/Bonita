import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductById, addToCart } from "../../Redux/Actions/actions";
import { useParams, useNavigate } from "react-router-dom";
import { FiShoppingCart } from "react-icons/fi";
import Navbar from "../Navbar";

const ProductDetails = () => {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);

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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Imagen principal y miniaturas */}
          <div className="flex flex-col gap-4">
            <div className="aspect-square rounded-lg overflow-hidden">
              <img
                src={product.images[selectedImage]}
                alt={product.description}
                className="w-full h-full object-cover"
              />
            </div>
            
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto py-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border-2 
                      ${selectedImage === index ? 'border-blue-500' : 'border-transparent'}`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detalles del producto */}
          <div className="flex flex-col h-full">
            <h2 className="text-2xl font-bold mb-4">{product.name}</h2>
            
            {/* Descripción con scroll y altura ajustada */}
            <div className="flex-grow mb-4 overflow-y-auto max-h-[calc(100vh-400px)]">
              <h2 className="text-2xl font-bold mb-4">
                {product.description}
              </h2>
              <p className="text-lg text-gray-500 mt-4">
                Marca: {product.marca}
              </p>
              <p className="text-lg text-gray-500 mt-2">
                Color: {product.colors}
              </p>
            </div>

            <div className="mt-auto space-y-4">
              <p className="text-xl font-semibold mb-80">Precio: ${product.priceSell}</p>
              <button
                onClick={handleAddToCart}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 
                  transition duration-200 flex items-center justify-center"
              >
                <FiShoppingCart className="inline-block mr-2" />
                Agregar al carrito
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
