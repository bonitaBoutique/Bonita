import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductById, addToCart } from "../../Redux/Actions/actions";
import { useParams, useNavigate } from "react-router-dom";
import { FiShoppingCart } from "react-icons/fi";

const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedImage, setSelectedImage] = useState(""); // Imagen seleccionada
  const [startIndex, setStartIndex] = useState(0);
  const itemsToShow = 5; // Número máximo de productos a mostrar a la vez







  const { product, similarProducts, loading, error } = useSelector((state) => ({
    product: state.product,
    similarProducts: state.similarProducts,
    loading: state.loading,
    error: state.error,
  }));
// Filtrar productos similares por color
const getUniqueColorProducts = (products) => {
  const uniqueColorsMap = new Map();

  products.forEach((product) => {
    product.colors.forEach((color) => {
      if (!uniqueColorsMap.has(color)) {
        uniqueColorsMap.set(color, product);
      }
    });
  });

  return Array.from(uniqueColorsMap.values());
};
  const containerRef = useRef(null);

  useEffect(() => {
    dispatch(fetchProductById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (product) {
      setSelectedProduct(product);
      setSelectedImage(
        product.Images && product.Images.length > 0
          ? product.Images[0].url
          : "https://via.placeholder.com/600"
      );
    }
  }, [product]);

  const getAvailableColors = () => {
    if (!selectedProduct || !similarProducts) return [];

    const matchingProducts = similarProducts.filter(
      (p) => p.id_SB === selectedProduct.id_SB && p.price === selectedProduct.price
    );

    return [...new Set(matchingProducts.flatMap((p) => p.colors))];
  };

  const getAvailableSizes = () => {
    if (!selectedProduct || !similarProducts) return [];

    const matchingProducts = similarProducts.filter(
      (p) =>
        p.id_SB === selectedProduct.id_SB &&
        p.colors.includes(selectedColor) &&
        p.price === selectedProduct.price
    );

    return [...new Set(matchingProducts.flatMap((p) => p.sizes))];
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Por favor, selecciona un talle.");
      return;
    }
    if (!selectedColor) {
      alert("Por favor, selecciona un color.");
      return;
    }

    const productToAdd = {
      ...selectedProduct,
      selectedSize,
      selectedColor,
    };

    dispatch(addToCart(productToAdd));
    navigate("/cart");
  };

  const handleViewSimilarProduct = (relatedProduct) => {
    setSelectedProduct(relatedProduct);
    setSelectedSize("");
    setSelectedColor("");

    setSelectedImage(
      relatedProduct.Images && relatedProduct.Images.length > 0
        ? relatedProduct.Images[0].url
        : "https://via.placeholder.com/600"
    );
  };

  

  const handleColorChange = (color) => {
    setSelectedColor(color);
    const matchingProduct = similarProducts.find(
      (p) =>
        p.id_SB === selectedProduct.id_SB &&
        p.price === selectedProduct.price &&
        p.colors.includes(color)
    );

    if (matchingProduct && matchingProduct.Images && matchingProduct.Images.length > 0) {
      setSelectedImage(matchingProduct.Images[0].url);
    }
  };

  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        left: -containerRef.current.clientWidth * 0.8, // Ajustar el desplazamiento según el tamaño visible
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        left: containerRef.current.clientWidth * 0.8, // Ajustar el desplazamiento según el tamaño visible
        behavior: "smooth",
      });
    }
  };

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const container = containerRef.current;

    const updateScrollButtons = () => {
      if (container) {
        setCanScrollLeft(container.scrollLeft > 0);
        setCanScrollRight(
          container.scrollLeft + container.clientWidth < container.scrollWidth
        );
      }
    };

    if (container) {
      updateScrollButtons(); // Inicial check

      container.addEventListener("scroll", updateScrollButtons);

      return () => {
        container.removeEventListener("scroll", updateScrollButtons);
      };
    }
  }, [similarProducts]);

  // Obtener productos únicos por color
  const uniqueColorProducts = getUniqueColorProducts(similarProducts);


  const handlePrevious = () => {
    setStartIndex((prev) => Math.max(prev - itemsToShow, 0));
  };

  const handleNext = () => {
    setStartIndex((prev) => Math.min(prev + itemsToShow, similarProducts.length - itemsToShow));
  };

  const visibleProducts = uniqueColorProducts.slice(startIndex, startIndex + itemsToShow);

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!selectedProduct) {
    return <div>No se encontró el producto.</div>;
  }

  return (
    <div className="full min-h-screen mb-36 bg-gray-900">
      <div className="relative min-h-screen flex items-center justify-center pt-8 z-10">
        <div className="bg-gray-100 rounded-lg shadow-lg p-6 lg:p-8 w-full max-w-6xl mx-4 sm:mx-6 lg:mx-8 flex flex-col">
          {/* Sección principal de detalles del producto */}
          <div className="flex flex-col lg:flex-row w-full">
            {/* Imágenes del producto */}
            <div className="w-full lg:w-1/2 p-4 flex flex-col lg:flex-row">
              {/* Imágenes en miniatura (verticales) */}
              <div className="flex flex-col space-y-2 lg:mr-4">
                {selectedProduct.Images &&
                  selectedProduct.Images.map((image, index) => (
                    <img
                      key={index}
                      src={image.url}
                      alt={selectedProduct.name}
                      className="w-16 h-16 object-cover object-center rounded-lg cursor-pointer border border-gray-300"
                      onClick={() => setSelectedImage(image.url)} // Al hacer clic cambia la imagen seleccionada
                    />
                  ))}
              </div>
              {/* Imagen principal */}
              <div className="flex-1">
                <img
                  src={selectedImage}
                  alt={selectedProduct.name}
                  className="w-full max-w-xs aspect-square object-cover object-center rounded-lg shadow-md"
                />
              </div>
            </div>

            {/* Línea vertical de separación */}
            <div className="hidden lg:block border-l-2 border-gray-300 mx-4"></div>

            {/* Detalles del producto */}
            <div className="w-full lg:w-1/2 p-4">
              <h2 className="text-3xl font-bold text-gray-800 mb-2 font-nunito bg-gray-100 p-2 rounded uppercase">
                {selectedProduct.name}
              </h2>
              <p className="text-lg text-gray-500 mb-4 font-nunito font-semibold">
                {selectedProduct.description}
              </p>
              <p className="text-lg text-gray-500 mb-4 font-nunito font-semibold">
                {selectedProduct.colors}
              </p>
              
              {/* Mostrar precio y material */}
              <div className="mb-4">
                <p className="text-xl font-semibold text-gray-800">
                  Precio: ${selectedProduct.price}
                </p>
                <p className="text-lg text-gray-600">
                  Material: {selectedProduct.materials.join(', ')}
                </p>
              </div>

              {/* Seleccionar color */}
              <div className="mb-4">
                <label
                  htmlFor="colors"
                  className="block text-sm font-medium text-gray-500"
                >
                  Colores
                </label>
                <select
                  value={selectedColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-relative bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-gray-300"
                >
                  <option value="">Seleccionar color</option>
                  {getAvailableColors().map((color, index) => (
                    <option key={index} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mostrar talles que coincidan */}
              {selectedColor && (
                <div className="mb-4">
                  <label
                    htmlFor="sizes"
                    className="block text-sm font-medium font-nunito text-gray-500"
                  >
                    Talles
                  </label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-gray-300"
                  >
                    <option value="">Seleccionar talle</option>
                    {getAvailableSizes().map((size, index) => (
                      <option key={index} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center">
                <button
                  className="bg-gray-800 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition duration-300"
                  onClick={handleAddToCart}
                >
                  <FiShoppingCart className="inline-block mr-2" />
                  Agregar al carrito
                </button>
              </div>
            </div>
          </div>

          {/* Productos relacionados */}
          <div className="relative mt-12">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              Productos relacionados
            </h3>
            <div className="relative flex items-center">
              {startIndex > 0 && (
                <button
                  onClick={handlePrevious}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full shadow-lg"
                >
                  ◀
                </button>
              )}
              <div
                ref={containerRef}
                className="overflow-x-auto whitespace-nowrap flex space-x-4"
                style={{ scrollBehavior: "smooth" }}
              >
                {visibleProducts.map((relatedProduct, index) => (
                  <div
                    key={index}
                    onClick={() => handleViewSimilarProduct(relatedProduct)}
                    className="inline-block w-20 h-20 object-cover object-center rounded-lg cursor-pointer"
                  >
                    <img
                      src={
                        relatedProduct.Images && relatedProduct.Images.length > 0
                          ? relatedProduct.Images[0].url
                          : "https://via.placeholder.com/600"
                      }
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
              {startIndex + itemsToShow < similarProducts.length && (
                <button
                  onClick={handleNext}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full shadow-lg"
                >
                  ▶
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;






