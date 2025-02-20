import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductById, addToCart } from "../../Redux/Actions/actions";
import { useParams, useNavigate } from "react-router-dom";
import { FiShoppingCart } from "react-icons/fi";
import Navbar from "../Navbar";

const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const product = useSelector((state) => state.product);

  useEffect(() => {
    const loadProduct = async () => {
      setIsLoading(true);
      await dispatch(fetchProductById(id));
      setIsLoading(false);
    };
    loadProduct();
  }, [dispatch, id]);

  const handleAddToCart = () => {
    if (product) {
      dispatch(addToCart(product));
      navigate("/cart");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-lg"></div>
              <div className="flex gap-2 mt-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="w-20 h-20 bg-gray-200 rounded-md"></div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return <div className="text-center py-8">Producto no encontrado</div>;
  }

  const images = product.images || [product.image || '/default-product.png'];

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 px-4 py-2 bg-colorBeigeClaro rounded-lg hover:bg-gray-200"
          >
            ← Volver
          </button>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Imagen principal y miniaturas */}
            <div className="flex flex-col gap-4">
              <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={images[selectedImage]}
                  alt={product.description}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto py-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border-2 
                        ${selectedImage === index ? 'border-blue-500' : 'border-transparent'}`}
                    >
                      <img
                        src={image}
                        alt={`Vista ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Detalles del producto */}
            <div className="flex flex-col h-full">
              <div className="flex-grow space-y-4">
                <h1 className="text-3xl font-bold text-slate-700 font-nunito uppercase">
                  {product.description}
                </h1>
                
                <div className="space-y-2">
                  <p className="text-gray-600">
                    <span className="font-semibold">Marca:</span> {product.marca}
                  </p>
                 
                  {product.sizes && (
                    <p className="text-gray-600 uppercase">
                      <span className="font-semibold">Tallas:</span> {product.sizes}
                    </p>
                  )}
                </div>

                <div className="text-2xl font-bold text-colorBeige">
                  ${product.priceSell}
                </div>

                <div className="prose max-w-none">
                  <p className="text-gray-600">{product.description}</p>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-colorBeige text-white py-3 px-4 rounded-lg hover:bg-blue-700 
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
    </>
  );
};

export default ProductDetails;