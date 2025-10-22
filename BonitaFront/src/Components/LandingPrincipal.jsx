import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../Redux/Actions/actions";
import { FiSearch, FiFilter, FiShoppingBag, FiHeart } from "react-icons/fi";
import { HiAdjustmentsHorizontal } from "react-icons/hi2";
import Navbar from "./Navbar";

const LandingPrincipal = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux state
  const products = useSelector((state) => state.products || []);
  const loading = useSelector((state) => state.loading);
  const searchResults = useSelector((state) => state.searchResults || []);
  const activePromotion = useSelector((state) => state.promotions?.activePromotion); // ✅ Promoción activa
  
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
  const productsPerLoad = 12; // Productos por carga

  // Cargar productos al inicio
  useEffect(() => {
    if (products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products.length]);

  // ✅ NUEVA LÓGICA DE AGRUPACIÓN (desde ProductsList)
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
      // Tomar el primer producto de cada grupo como representante
      const representative = group[0];
      // Calcular stock total del grupo
      const totalStock = group.reduce((sum, product) => sum + product.stock, 0);
      
      return {
        ...representative,
        groupStock: totalStock,
        groupSize: group.length,
        group: group
      };
    });

    // Filtro por búsqueda (ya aplicado en activeProducts)
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
    
    // Resetear scroll infinito cuando cambian los filtros
    const initialProducts = filtered.slice(0, productsPerLoad);
    setDisplayedProducts(initialProducts);
    setCurrentIndex(productsPerLoad);
    setHasMore(filtered.length > productsPerLoad);
  }, [products, searchResults, searchTerm, priceFilter, sortBy]);

  // Función para cargar más productos
  const loadMoreProducts = useCallback(() => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    
    // Simular delay de carga (opcional)
    setTimeout(() => {
      const nextProducts = filteredProducts.slice(currentIndex, currentIndex + productsPerLoad);
      const newIndex = currentIndex + productsPerLoad;
      
      setDisplayedProducts(prev => [...prev, ...nextProducts]);
      setCurrentIndex(newIndex);
      setHasMore(newIndex < filteredProducts.length);
      setIsLoadingMore(false);
    }, 300);
  }, [filteredProducts, currentIndex, isLoadingMore, hasMore]);

  // Detectar scroll para cargar más productos
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= 
          document.documentElement.offsetHeight - 1000) { // 1000px antes del final
        loadMoreProducts();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMoreProducts]);

  // Función para limpiar filtros
  const clearFilters = () => {
    setSearchTerm("");
    setPriceFilter({ min: "", max: "" });
    setSortBy("newest");
  };

  return (
    <>
      <Navbar />
      
      {/* Hero Section Minimalista */}
      <section className="relative bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen pt-20">
        {/* Header con título y carrito fijo */}
        <div className="fixed top-20 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-light text-gray-900 tracking-tight">
                  BONITA BOUTIQUE CUMARAL
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredProducts.length} productos únicos disponibles
                </p>
              </div>
              
              {/* Carrito fijo en header */}
              <button
                onClick={() => navigate('/cart')}
                className="relative p-3 bg-black text-white rounded-full hover:bg-gray-800 transition-all duration-300 group"
              >
                <FiShoppingBag className="w-6 h-6" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  0
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-6">
              
              {/* Búsqueda */}
              <div className="flex-1">
                <div className="relative">
                  <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300"
                  />
                </div>
              </div>

              {/* Filtros de precio */}
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

              {/* Ordenamiento */}
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

              {/* Botón limpiar filtros */}
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
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-black border-t-transparent"></div>
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
                    activePromotion={activePromotion} 
                    onProductClick={() => navigate(`/product/${representative.id_product}`, {
                      state: { group: representative.group }
                    })}
                  />
                ))}
              </div>

              {/* Indicador de carga infinita */}
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

              {/* Estado vacío */}
              {displayedProducts.length === 0 && !loading && (
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
              )}

              {/* Botón scroll to top (aparece después de cargar varios productos) */}
              {displayedProducts.length > 24 && (
                <div className="fixed bottom-8 right-8 z-30">
                  <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="p-3 bg-black text-white rounded-full shadow-lg hover:bg-gray-800 transition-all duration-300 hover:scale-110"
                    title="Volver arriba"
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
      </section>

      {/* Footer minimalista */}
      <footer className="bg-gray-50 border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Trust Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Cambios y Devoluciones */}
            <div className="flex items-center justify-center text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <svg className="w-12 h-12 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 text-lg">CAMBIOS Y</h3>
                  <h3 className="font-semibold text-gray-900 text-lg">DEVOLUCIONES</h3>
                  <p className="text-sm text-gray-600 mt-1">Hasta 30 días para cambios</p>
                </div>
              </div>
            </div>

            {/* Compra Segura */}
            <div className="flex items-center justify-center text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <svg className="w-12 h-12 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 text-lg">COMPRA 100%</h3>
                  <h3 className="font-semibold text-gray-900 text-lg">SEGURA</h3>
                  <p className="text-sm text-gray-600 mt-1">Pagos protegidos SSL</p>
                </div>
              </div>
            </div>

            {/* Múltiples Medios de Pago */}
            <div className="flex items-center justify-center text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <svg className="w-12 h-12 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 text-lg">MÚLTIPLES MEDIOS</h3>
                  <h3 className="font-semibold text-gray-900 text-lg">DE PAGO</h3>
                  <p className="text-sm text-gray-600 mt-1">Efectivo, tarjetas, transferencias</p>
                </div>
              </div>
            </div>
          </div>

          {/* Información adicional del footer */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-medium text-gray-900 mb-4">💳 Métodos de pago</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>💳 Todas las tarjetas</p>
                <p>💰 Efectivo contra entrega</p>
                <p>🏦 Transferencia bancaria</p>
                <p>📱 Wompi Nequi Addi Sistecrédito </p>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-4">🕒 Atención</h3>
              <p className="text-sm text-gray-600">Lun - Dom: 9AM - 12AM</p>
              <p className="text-sm text-gray-600">Lun - Dom: 2PM - 8PM</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-4">🚚 Envíos</h3>
              <p className="text-sm text-gray-600">Gratis en compras +$300.000</p>
              <p className="text-sm text-gray-600">Entrega 2-5 días hábiles</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-4">📞 Contacto</h3>
              <p className="text-sm text-gray-600">📧 BonitaBoutiqueCumaral@gmail.com</p>
              <p className="text-sm text-gray-600">📱 +57 311 831 8191</p>
              <p className="text-sm text-gray-600">📍 Cumaral, Colombia</p>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="mt-8 pt-8 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              © 2025 Bonita Boutique. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

// ✅ COMPONENTE PRODUCTCARD ACTUALIZADO CON LÓGICA DE GRUPOS
const ProductCard = ({ product, group, activePromotion, onProductClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // ✅ Debug: Verificar si llega la promoción (solo una vez por montaje)
  useEffect(() => {
    if (product.id_product === 'B001') { // Solo para el primer producto
      console.log('🎨 ProductCard - activePromotion:', activePromotion);
    }
  }, [activePromotion]);

  // Calcular stock total del grupo
  const totalStock = group ? group.reduce((sum, p) => sum + p.stock, 0) : product.stock;
  const hasMultipleVariants = group && group.length > 1;

  // ✅ Calcular precio con descuento
  const originalPrice = product.priceSell;
  let discountedPrice = originalPrice;
  let discountPercentage = 0;
  
  if (activePromotion?.is_active && activePromotion?.discount_percentage) {
    discountPercentage = activePromotion.discount_percentage;
    discountedPrice = Math.round(originalPrice * (1 - discountPercentage / 100));
  }

  const hasDiscount = discountPercentage > 0;

  return (
    <div 
      className="group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onProductClick}
    >
      {/* Imagen del producto */}
      <div className="relative bg-gray-50 rounded-2xl overflow-hidden mb-4 aspect-[3/4]">
        <img
          src={product.images && product.images.length > 0 ? product.images[0] : "https://via.placeholder.com/300x400/f3f4f6/9ca3af?text=Sin+Imagen"}
          alt={product.description}
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
        />
        
        {/* Overlay con acciones */}
        <div className={`absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-end justify-end p-4 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFavorite(!isFavorite);
            }}
            className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all duration-300"
          >
            <FiHeart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
          </button>
        </div>

        {/* Badges */}
        <div className="absolute top-4 left-4 space-y-2">
          {/* ✅ Badge de DESCUENTO (prioridad máxima) */}
          {hasDiscount && (
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg animate-pulse">
              -{discountPercentage}% OFF
            </div>
          )}
          
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
      </div>

      {/* Información del producto */}
      <div className="space-y-2">
        <h3 className="text-gray-900 font-medium text-lg leading-tight group-hover:text-gray-600 transition-colors duration-300">
          {product.description}
        </h3>
        
        {/* ✅ PRECIOS CON DESCUENTO */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            {hasDiscount ? (
              <>
                {/* Precio original tachado */}
                <p className="text-sm text-gray-400 line-through">
                  {new Intl.NumberFormat("es-CO", {
                    style: "currency",
                    currency: "COP",
                    minimumFractionDigits: 0,
                  }).format(originalPrice)}
                </p>
                {/* Precio con descuento */}
                <p className="text-2xl font-bold text-purple-600">
                  {new Intl.NumberFormat("es-CO", {
                    style: "currency",
                    currency: "COP",
                    minimumFractionDigits: 0,
                  }).format(discountedPrice)}
                </p>
                {/* Ahorro */}
                <p className="text-xs text-green-600 font-medium">
                  Ahorras {new Intl.NumberFormat("es-CO", {
                    style: "currency",
                    currency: "COP",
                    minimumFractionDigits: 0,
                  }).format(originalPrice - discountedPrice)}
                </p>
              </>
            ) : (
              /* Precio normal sin descuento */
              <p className="text-xl font-light text-gray-900">
                {new Intl.NumberFormat("es-CO", {
                  style: "currency",
                  currency: "COP",
                  minimumFractionDigits: 0,
                }).format(originalPrice)}
              </p>
            )}
          </div>
          
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
      </div>
    </div>
  );
};

export default LandingPrincipal;