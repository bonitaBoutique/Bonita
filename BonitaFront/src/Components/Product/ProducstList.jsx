import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchProducts, deleteProduct } from "../../Redux/Actions/actions";
import { FiSearch, FiShoppingBag, FiHeart, FiEdit, FiTrash, FiShoppingCart } from "react-icons/fi";
import { HiAdjustmentsHorizontal } from "react-icons/hi2";
import Swal from "sweetalert2";
import Navbar from "../Navbar";
import SearchComponent from "./SearchComponent";

const ProductsList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux state
  const products = useSelector((state) => state.products || []);
  const loading = useSelector((state) => state.loading);
  const error = useSelector((state) => state.error);
  const searchResults = useSelector((state) => state.searchResults || []);
  const userInfo = useSelector((state) => state.userLogin?.userInfo);
  
  // Estados locales
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState("newest");
  
  // Estados para scroll infinito
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const productsPerLoad = 12;

  // Cargar productos al inicio
  useEffect(() => {
    if (products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products.length]);

  // ✅ LÓGICA DE AGRUPACIÓN (conservada tal como está)
  useEffect(() => {
    // Mostrar productos filtrados si existen, de lo contrario, mostrar todos.
    // Filtramos por stock y que sea tiendaOnLine.
    const activeProducts = (
      searchResults.length > 0 ? searchResults : products
    ).filter((product) => product.stock > 0 && product.tiendaOnLine === true);

    // Agrupamos productos por descripción para mostrar solo uno por grupo.
    const groupedProducts = {};
    activeProducts.forEach((product) => {
      const key = product.description.trim();
      if (groupedProducts[key]) {
        groupedProducts[key].push(product);
      } else {
        groupedProducts[key] = [product];
      }
    });

    // Convertimos el objeto en un arreglo donde cada elemento es un grupo.
    const uniqueGroups = Object.values(groupedProducts);

    // Aplicar filtros adicionales
    let filtered = uniqueGroups.map(group => {
      const representative = group[0];
      const totalStock = group.reduce((sum, product) => sum + product.stock, 0);
      
      return {
        ...representative,
        groupStock: totalStock,
        groupSize: group.length,
        group: group
      };
    });

    // Filtro por búsqueda
    if (searchTerm && searchResults.length === 0) {
      filtered = filtered.filter((representative) =>
        representative.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por precio
    if (priceFilter.min) {
      filtered = filtered.filter((representative) => 
        representative.priceSell >= parseFloat(priceFilter.min)
      );
    }
    if (priceFilter.max) {
      filtered = filtered.filter((representative) => 
        representative.priceSell <= parseFloat(priceFilter.max)
      );
    }

    // Ordenamiento
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt || b.id_product) - new Date(a.createdAt || a.id_product));
        break;
      case "price-asc":
        filtered.sort((a, b) => a.priceSell - b.priceSell);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.priceSell - a.priceSell);
        break;
      case "name":
        filtered.sort((a, b) => a.description.localeCompare(b.description));
        break;
      case "stock":
        filtered.sort((a, b) => b.groupStock - a.groupStock);
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
    
    // Resetear scroll infinito
    const initialProducts = filtered.slice(0, productsPerLoad);
    setDisplayedProducts(initialProducts);
    setCurrentIndex(productsPerLoad);
    setHasMore(filtered.length > productsPerLoad);
  }, [products, searchResults, searchTerm, priceFilter, sortBy]);

  // Scroll infinito
  const loadMoreProducts = useCallback(() => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    
    setTimeout(() => {
      const nextProducts = filteredProducts.slice(currentIndex, currentIndex + productsPerLoad);
      const newIndex = currentIndex + productsPerLoad;
      
      setDisplayedProducts(prev => [...prev, ...nextProducts]);
      setCurrentIndex(newIndex);
      setHasMore(newIndex < filteredProducts.length);
      setIsLoadingMore(false);
    }, 300);
  }, [filteredProducts, currentIndex, isLoadingMore, hasMore]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= 
          document.documentElement.offsetHeight - 1000) {
        loadMoreProducts();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMoreProducts]);

  // ✅ FUNCIONES DE ADMINISTRADOR (conservadas exactamente como están)
  const handleEditProduct = (id_product) => {
    navigate(`/updateProduct/${id_product}`);
  };

  const handleDeleteProduct = (id_product) => {
    Swal.fire({
      title: "¿Eliminar producto?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteProduct(id_product))
          .then(() => {
            Swal.fire(
              "¡Eliminado!",
              "El producto ha sido eliminado.",
              "success"
            );
          })
          .catch((err) => {
            Swal.fire("Error", "No se pudo eliminar el producto.", "error");
          });
      }
    });
  };

  // Función para limpiar filtros
  const clearFilters = () => {
    setSearchTerm("");
    setPriceFilter({ min: "", max: "" });
    setSortBy("newest");
  };

  // Estados de loading y error
  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-black border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      
      {/* Header moderno */}
      <div className="relative bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen pt-20">
        
        {/* Header fijo */}
        <div className="fixed top-20 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-light text-gray-900 tracking-tight">
                  PRODUCTOS BONITA BOUTIQUE
                </h1>
                
              </div>
              
              <button
                onClick={() => navigate('/cart')}
                className="relative p-3 bg-black text-white rounded-full hover:bg-gray-800 transition-all duration-300"
              >
                <FiShoppingBag className="w-6 h-6" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  0
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32">
          
          
          {/* Panel de filtros */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-6">
              
              <div className="flex-1">
                <div className="relative">
                  <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre del producto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="Precio mín"
                  value={priceFilter.min}
                  onChange={(e) => setPriceFilter(prev => ({ ...prev, min: e.target.value }))}
                  className="w-32 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="Precio máx"
                  value={priceFilter.max}
                  onChange={(e) => setPriceFilter(prev => ({ ...prev, max: e.target.value }))}
                  className="w-32 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent bg-white"
              >
                <option value="newest">Más recientes</option>
                <option value="price-asc">Precio: menor a mayor</option>
                <option value="price-desc">Precio: mayor a menor</option>
                <option value="name">Nombre A-Z</option>
                <option value="stock">Mayor stock disponible</option>
              </select>

              <button
                onClick={clearFilters}
                className="px-6 py-3 text-gray-600 hover:text-black transition-colors duration-300 flex items-center gap-2"
              >
                <HiAdjustmentsHorizontal className="w-5 h-5" />
                Limpiar
              </button>
            </div>
          </div>

          {/* Grid de productos */}
          {filteredProducts.length === 0 && !loading ? (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <FiSearch className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No encontramos productos
                </h3>
                <p className="text-gray-600 mb-6">
                  Intenta ajustar los filtros o buscar con otros términos.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Grid principal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {displayedProducts.map((representative, index) => (
                  <ProductCard
                    key={`${representative.id_product}-${index}`}
                    product={representative}
                    group={representative.group}
                    userInfo={userInfo}
                    onProductClick={() => navigate(`/product/${representative.id_product}`, {
                      state: { group: representative.group }
                    })}
                    onEditProduct={handleEditProduct}
                    onDeleteProduct={handleDeleteProduct}
                  />
                ))}
              </div>

              {/* Indicador de carga */}
              {isLoadingMore && (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-black"></div>
                    <span className="text-sm font-medium">Cargando más productos...</span>
                  </div>
                </div>
              )}

              {/* Mensaje de final */}
              {!hasMore && displayedProducts.length > 0 && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 rounded-full text-gray-600">
                    <span className="text-sm font-medium">
                      ✨ Has visto todos los productos ({filteredProducts.length})
                    </span>
                  </div>
                </div>
              )}

              {/* Scroll to top */}
              {displayedProducts.length > 24 && (
                <div className="fixed bottom-8 right-8 z-30">
                  <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="p-3 bg-black text-white rounded-full shadow-lg hover:bg-gray-800 transition-all duration-300 hover:scale-110"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

// ✅ COMPONENTE PRODUCTCARD CON FUNCIONALIDADES DE ADMIN CONSERVADAS
const ProductCard = ({ 
  product, 
  group, 
  userInfo, 
  onProductClick, 
  onEditProduct, 
  onDeleteProduct 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Calcular stock del grupo
  const totalStock = group ? group.reduce((sum, p) => sum + p.stock, 0) : product.stock;
  const hasMultipleVariants = group && group.length > 1;

   return (
    <div 
      className="group cursor-pointer relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Imagen del producto */}
      <div className="relative bg-gray-50 rounded-2xl overflow-hidden mb-4 aspect-[3/4]">
        <Link to={`/product/${product.id_product}`} state={{ group }}>
          <img
            src={product.images && product.images.length > 0 ? product.images[0] : "https://via.placeholder.com/300x400"}
            alt={product.description || "Producto sin nombre"}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
          />
        </Link>
        
        {/* ✅ BADGES ACTUALIZADOS - IGUAL QUE EN LANDINGPRINCIPAL */}
        <div className="absolute top-4 left-4 space-y-2">
          {/* Badge de múltiples variantes */}
          {hasMultipleVariants && (
            <div className="bg-pink-500 text-white px-3 py-1 rounded-full text-xs font-medium">
              +{group.length} variantes
            </div>
          )}
          
          {/* Badge de stock */}
          {totalStock === 1 ? (
            <div className="bg-pink-400 text-white px-3 py-1 rounded-full text-xs font-medium">
              ÚNICO
            </div>
          ) : totalStock <= 5 ? (
            <div className="bg-pink-500 text-white px-3 py-1 rounded-full text-xs font-medium">
              Solo {totalStock} disponibles
            </div>
          ) : null}
        </div>

        {/* ✅ BOTONES DE ADMINISTRADOR (conservados exactamente como están) */}
        {userInfo && userInfo.role === "Admin" && (
          <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              className="bg-white/90 backdrop-blur-sm text-gray-700 p-2 rounded-full hover:bg-white transition-all duration-300"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEditProduct(product.id_product);
              }}
            >
              <FiEdit size={16} />
            </button>
            <button
              className="bg-red-500/90 backdrop-blur-sm text-white p-2 rounded-full hover:bg-red-500 transition-all duration-300"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDeleteProduct(product.id_product);
              }}
            >
              <FiTrash size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Información del producto */}
      <div className="space-y-3">
        <h3 className="text-gray-900 font-medium text-lg leading-tight group-hover:text-gray-600 transition-colors duration-300">
          <Link 
            to={`/product/${product.id_product}`} 
            state={{ group }}
            className="hover:text-gray-600"
          >
            {product.description}
          </Link>
        </h3>
        
        <div className="flex items-center justify-between">
          <p className="text-xl font-light text-gray-900">
            {new Intl.NumberFormat("es-CO", {
              style: "currency",
              currency: "COP",
              minimumFractionDigits: 0,
            }).format(product.priceSell)}
          </p>
          
          <span className="text-sm text-gray-500">
            {totalStock} en stock
          </span>
        </div>

        {/* Información adicional */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="font-mono">{product.id_product}</span>
          {hasMultipleVariants && (
            <span className="text-blue-500 font-medium">Ver todas las opciones</span>
          )}
        </div>

        {/* Botón de acción principal */}
        <Link
          to={`/product/${product.id_product}`}
          state={{ group }}
          className="block w-full mt-4 bg-black text-white py-3 px-4 rounded-xl hover:bg-gray-800 transition-all duration-300 text-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
        >
          <div className="flex items-center justify-center gap-2">
            <FiShoppingCart className="w-4 h-4" />
            Añadir al carrito
          </div>
        </Link>
      </div>
    </div>
  );
};

export default ProductsList;