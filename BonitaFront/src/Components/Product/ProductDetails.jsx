import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductById, addToCart } from "../../Redux/Actions/actions";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FiShoppingCart } from "react-icons/fi";
import Navbar from "../Navbar";

const ProductDetails = () => {
  const { id } = useParams();
  const location = useLocation();   
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(""); // Estado para la talla
  const [isLoading, setIsLoading] = useState(true);

  // Si el detalle viene con un grupo (de la lista agrupada), se usará ese grupo para extraer tallas
  const groupFromState = location.state?.group;
  const product = useSelector((state) => state.product);
  const activePromotion = useSelector((state) => state.promotions?.activePromotion); // ✅ Promoción activa

  useEffect(() => {
    // Si se envía un grupo, ya tenemos un representante; de lo contrario, consultamos el back
    if (!groupFromState) {
      const loadProduct = async () => {
        setIsLoading(true);
        await dispatch(fetchProductById(id));
        setIsLoading(false);
      };
      loadProduct();
    } else {
      setIsLoading(false);
    }
  }, [dispatch, id, groupFromState]);

  // Definimos referenceProduct para usarlo tanto en el render como en el carrito.
  const referenceProduct = groupFromState ? groupFromState[0] : product;
  const images = referenceProduct?.images || [referenceProduct?.image || '/default-product.png'];

  // Construimos el arreglo de tallas
  let sizesArray = [];
  if (groupFromState && groupFromState.length > 0) {
    sizesArray = Array.from(new Set(groupFromState.map(item => item.sizes))).filter(Boolean);
  } else {
    sizesArray =
      referenceProduct?.sizes && typeof referenceProduct.sizes === "string"
        ? referenceProduct.sizes.split(",").map((s) => s.trim())
        : referenceProduct?.sizes || [];
  }
  console.log("Tallas obtenidas:", sizesArray);

  const handleAddToCart = () => {
    let productToAdd;
    if (groupFromState && groupFromState.length > 0) {
      // Buscamos la variante que coincida con la talla seleccionada en el grupo
      productToAdd = groupFromState.find((item) => item.sizes === selectedSize);
      if (!productToAdd) {
        alert("Por favor selecciona una talla");
        return;
      }
    } else if (product) {
      productToAdd = { ...product };
      if (selectedSize) {
        productToAdd.selectedSize = selectedSize;
      }
    }
    dispatch(addToCart(productToAdd));
    navigate("/cart");
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
                  alt={referenceProduct.description}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto py-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border-2 ${
                        selectedImage === index ? "border-blue-500" : "border-transparent"
                      }`}
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
                <h1 className="text-3xl font-bold text-slate-700 font-monserrat uppercase">
                  {referenceProduct.description}
                </h1>
                
                {/* ✅ AGREGAR CÓDIGO DE PROVEEDOR */}
                {referenceProduct.codigoProv && (
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    
                    <p className="text-lg font-mono text-gray-800 mt-1">
                      {referenceProduct.codigoProv}
                    </p>
                  </div>
                )}
                
                {/* Selector de tallas */}
                {sizesArray.length > 0 && (
                  <div className="mt-4">
                    <span className="text-gray-600 uppercase font-semibold">Tallas:</span>
                    <div className="mt-2 flex gap-2">
                      {sizesArray.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-3 py-1 border rounded-lg ${
                            selectedSize === size ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* ✅ PRECIO CON DESCUENTO */}
                <div className="space-y-2">
                  {activePromotion && activePromotion.discount_percentage ? (
                    <>
                      {/* Badge de descuento */}
                      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                        <span>🎉 {activePromotion.title}</span>
                        <span className="bg-white/20 px-2 py-0.5 rounded-full">-{activePromotion.discount_percentage}%</span>
                      </div>
                      
                      {/* Precios */}
                      <div className="flex items-center gap-3">
                        {/* Precio original tachado */}
                        <span className="text-xl text-gray-400 line-through">
                          {new Intl.NumberFormat("es-CO", {
                            style: "currency",
                            currency: "COP",
                            minimumFractionDigits: 0,
                          }).format(referenceProduct.priceSell)}
                        </span>
                        
                        {/* Precio con descuento */}
                        <span className="text-3xl font-bold text-purple-600">
                          {new Intl.NumberFormat("es-CO", {
                            style: "currency",
                            currency: "COP",
                            minimumFractionDigits: 0,
                          }).format(Math.round(referenceProduct.priceSell * (1 - activePromotion.discount_percentage / 100)))}
                        </span>
                      </div>
                      
                      {/* Ahorro */}
                      <p className="text-sm text-green-600 font-semibold">
                        ¡Ahorras {new Intl.NumberFormat("es-CO", {
                          style: "currency",
                          currency: "COP",
                          minimumFractionDigits: 0,
                        }).format(Math.round(referenceProduct.priceSell * activePromotion.discount_percentage / 100))}!
                      </p>
                    </>
                  ) : (
                    <div className="text-2xl font-bold text-colorBeige">
                      {new Intl.NumberFormat("es-CO", {
                        style: "currency",
                        currency: "COP",
                        minimumFractionDigits: 0,
                      }).format(referenceProduct.priceSell)}
                    </div>
                  )}
                </div>

                <div className="prose max-w-none">
                  <p className="text-gray-600">{referenceProduct.description}</p>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-colorBeige text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center"
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