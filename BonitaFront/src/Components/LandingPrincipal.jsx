import React, { useState, useEffect } from "react";
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
  
  // Estados locales
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState("newest"); // newest, price-asc, price-desc, name
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);

  // Cargar productos al inicio
  useEffect(() => {
    if (products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products.length]);

  // Filtrar y ordenar productos
  useEffect(() => {
    let filtered = products.filter(
      (product) => product.stock > 0 && product.tiendaOnLine === true
    );

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter((product) =>
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por precio
    if (priceFilter.min) {
      filtered = filtered.filter((product) => product.priceSell >= parseFloat(priceFilter.min));
    }
    if (priceFilter.max) {
      filtered = filtered.filter((product) => product.priceSell <= parseFloat(priceFilter.max));
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
      default:
        break;
    }

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset página al filtrar
  }, [products, searchTerm, priceFilter, sortBy]);

  // Paginación
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

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
        <div className="fixed top-20 left-0 right-0 bg-pink/95 backdrop-blur-sm border-b border-pink-500 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-light text-pink-500 tracking-tight">
                  BONITA BOUTIQUE CUMARAL
                </h1>
                
              </div>
              
              {/* Carrito fijo en header */}
              <button
                onClick={() => navigate('/cart')}
                className="relative p-3 bg-black text-white rounded-full hover:bg-gray-800 transition-all duration-300 group"
              >
                <FiShoppingBag className="w-6 h-6" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  0 {/* Aquí conectarías con tu estado del carrito */}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {currentProducts.map((product) => (
                  <ProductCard 
                    key={product.id_product} 
                    product={product}
                    onProductClick={() => navigate(`/product/${product.id_product}`)}
                  />
                ))}
              </div>

              {/* Paginación */}
             {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 py-12">
                  {/* Botón Primera página */}
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-gray-600 disabled:text-gray-300 hover:text-black transition-colors disabled:cursor-not-allowed"
                    title="Primera página"
                  >
                    ««
                  </button>
                  
                  {/* Botón Anterior */}
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-gray-600 disabled:text-gray-300 hover:text-black transition-colors disabled:cursor-not-allowed"
                  >
                    « Anterior
                  </button>
                  
                  {/* Páginas visibles - lógica de 5 páginas */}
                  {(() => {
                    const maxVisiblePages = 5;
                    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                    
                    // Ajustar el inicio si no hay suficientes páginas al final
                    if (endPage - startPage + 1 < maxVisiblePages) {
                      startPage = Math.max(1, endPage - maxVisiblePages + 1);
                    }
                    
                    const pages = [];
                    
                    // Mostrar "..." si hay páginas anteriores
                    if (startPage > 1) {
                      pages.push(
                        <button
                          key={1}
                          onClick={() => setCurrentPage(1)}
                          className="px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all"
                        >
                          1
                        </button>
                      );
                      if (startPage > 2) {
                        pages.push(
                          <span key="dots-start" className="px-2 py-2 text-gray-400">
                            ...
                          </span>
                        );
                      }
                    }
                    
                    // Páginas principales
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i)}
                          className={`px-4 py-2 rounded-lg transition-all font-medium ${
                            currentPage === i
                              ? 'bg-black text-white shadow-md'
                              : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                          }`}
                        >
                          {i}
                        </button>
                      );
                    }
                    
                    // Mostrar "..." si hay páginas posteriores
                    if (endPage < totalPages) {
                      if (endPage < totalPages - 1) {
                        pages.push(
                          <span key="dots-end" className="px-2 py-2 text-gray-400">
                            ...
                          </span>
                        );
                      }
                      pages.push(
                        <button
                          key={totalPages}
                          onClick={() => setCurrentPage(totalPages)}
                          className="px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all"
                        >
                          {totalPages}
                        </button>
                      );
                    }
                    
                    return pages;
                  })()}
                  
                  {/* Botón Siguiente */}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-gray-600 disabled:text-gray-300 hover:text-black transition-colors disabled:cursor-not-allowed"
                  >
                    Siguiente »
                  </button>
                  
                  {/* Botón Última página */}
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-gray-600 disabled:text-gray-300 hover:text-black transition-colors disabled:cursor-not-allowed"
                    title="Última página"
                  >
                    »»
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
          
          {/* ✅ NUEVA SECCIÓN: Trust Bar inspirada en la imagen */}
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

          {/* ✅ Información adicional del footer */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-medium text-gray-900 mb-4">💳 Métodos de pago</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>💳 Todas las tarjetas</p>
                <p>💰 Efectivo contra entrega</p>
                <p>🏦 Transferencia bancaria</p>
                <p>📱 Wompi Nequi & Bancolombia</p>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-4">🕒 Atención</h3>
              <p className="text-sm text-gray-600">Lun - Sáb: 9AM - 7PM</p>
              <p className="text-sm text-gray-600">Dom: 10AM - 5PM</p>
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
            
          </div>
        </div>
      </footer>
    </>
  );
};

// Componente ProductCard minimalista
const ProductCard = ({ product, onProductClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

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
          src={product.images && product.images.length > 0 ? product.images[0] : "https://via.placeholder.com/300"}
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

        {/* Badge de stock bajo */}
        {product.stock <= 5 && (
          <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
            Solo {product.stock} disponibles
          </div>
        )}
      </div>

      {/* Información del producto */}
      <div className="space-y-2">
        <h3 className="text-gray-900 font-medium text-lg leading-tight group-hover:text-gray-600 transition-colors duration-300">
          {product.description}
        </h3>
        
        <div className="flex items-center justify-between">
          <p className="text-xl font-light text-gray-900">
            {new Intl.NumberFormat("es-CO", {
              style: "currency",
              currency: "COP",
              minimumFractionDigits: 0,
            }).format(product.priceSell)}
          </p>
          
          {product.stock > 0 && (
            <span className="text-sm text-gray-500">
              {product.stock} en stock
            </span>
          )}
        </div>

        {/* Código del producto */}
        <p className="text-xs text-gray-400 font-mono">
          {product.id_product}
        </p>
      </div>
    </div>
  );
};

export default LandingPrincipal;