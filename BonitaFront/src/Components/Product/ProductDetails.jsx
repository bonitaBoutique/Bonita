import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductById, addToCart } from "../../Redux/Actions/actions";
import { useParams, useNavigate } from "react-router-dom";
import { FiShoppingCart } from "react-icons/fi";

const ProductDetails = () => {
  const { id } = useParams();
  console.log(id)
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [selectedImage, setSelectedImage] = useState("");

  // Obtener producto desde Redux
  const  product = useSelector((state) =>  state.product);
  console.log(product)
  const loading = useSelector((state) => state.loading);
  const error = useSelector((state) => state.error);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (product) {
      setSelectedImage(
        product.Images?.length > 0 ? product.Images[0].url : "https://via.placeholder.com/600"
      );
    }
  }, [product]);

  const handleAddToCart = () => {
    if (product) {
      dispatch(addToCart(product));
      navigate("/cart");
    }
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  if (loading) return <p>Cargando producto...</p>;
  if (error) return <p>Error al cargar el producto: {error}</p>;

  return (
    <div className="full min-h-screen mb-36 bg-gray-900">
      <div className="relative min-h-screen flex items-center justify-center pt-8 z-10">
        <div className="bg-gray-100 rounded-lg shadow-lg p-6 lg:p-8 w-full max-w-6xl flex flex-col">
          
          <div className="flex flex-col lg:flex-row">
            <div className="w-full lg:w-1/2 p-4 flex flex-col">
              <div className="flex flex-row space-x-2">
                {product.Images?.map((image, index) => (
                  <img
                    key={index}
                    src={image.url}
                    alt={product.name}
                    className="w-16 h-16 object-cover cursor-pointer rounded-lg border border-gray-300"
                    onClick={() => handleImageClick(image.url)}
                  />
                ))}
              </div>
              <img
                src={selectedImage}
                alt={product.name}
                className="mt-4 w-full max-w-md aspect-square object-cover rounded-lg"
              />
            </div>

            {/* Detalles del producto */}
            <div className="w-full lg:w-1/2 p-4">
              <h2 className="text-3xl font-bold text-gray-800 mb-2 uppercase">{product.name}</h2>
              <p className="text-lg text-gray-500 mb-4">{product.description}</p>
              <p className="text-lg text-gray-500 mb-4">Color: {product.colors}</p>
              <p className="text-xl font-semibold text-gray-800">Precio: ${product.price}</p>

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







