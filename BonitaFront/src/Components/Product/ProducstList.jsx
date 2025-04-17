import { useEffect, useState, useCallback } from "react"; // Importa useCallback
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, deleteProduct } from "../../Redux/Actions/actions";
import { Link, useNavigate } from "react-router-dom";
import { FiShoppingCart, FiEdit, FiTrash } from "react-icons/fi";
import Swal from "sweetalert2";
import Navbar from "../Navbar";
import SearchComponent from "./SearchComponent";

const ProductsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // --- Estado para Scroll Infinito ---
  const initialLoadCount = 12; // Número inicial de grupos a mostrar
  const loadMoreCount = 6; // Número de grupos a añadir cada vez
  const [visibleCount, setVisibleCount] = useState(initialLoadCount);
  const [isLoadingMore, setIsLoadingMore] = useState(false); // Para indicar carga
  // ---------------------------------

  // Selecciona los datos del estado global
  const products = useSelector((state) => state.products || []);
  const searchResults = useSelector((state) => state.searchResults || []);
  const loading = useSelector((state) => state.loading); // Loading inicial de fetchProducts
  const error = useSelector((state) => state.error);
  const userInfo = useSelector((state) => state.userLogin?.userInfo);

  useEffect(() => {
    // Cargar todos los productos al inicio si no hay ya
    if (products.length === 0) {
        dispatch(fetchProducts());
    }
  }, [dispatch, products.length]);

  // Mostrar productos filtrados si existen, de lo contrario, mostrar todos.
  // Filtramos por stock y que sea tiendaOnLine.
  const activeProducts = (searchResults.length > 0 ? searchResults : products).filter(
    (product) => product.stock > 0 && product.tiendaOnLine === true
  );

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

  // --- Lógica de Scroll Infinito ---
  const handleScroll = useCallback(() => {
    // window.innerHeight: Altura visible del viewport.
    // document.documentElement.scrollTop: Cuánto se ha scrolleado desde arriba.
    // document.documentElement.offsetHeight: Altura total del contenido de la página.
    // Umbral: Un pequeño margen antes de llegar al fondo exacto.
    const threshold = 100;
    if (
      window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - threshold &&
      !isLoadingMore && // Evita cargas múltiples si ya está cargando
      visibleCount < uniqueGroups.length // Solo carga si hay más items por mostrar
    ) {
      setIsLoadingMore(true); // Marca como cargando
      // Simula un pequeño delay para la carga (opcional, mejora UX)
      setTimeout(() => {
        setVisibleCount((prevCount) => prevCount + loadMoreCount);
        setIsLoadingMore(false); // Marca como terminado
      }, 500); // 500ms delay
    }
  }, [isLoadingMore, visibleCount, uniqueGroups.length]); // Dependencias del useCallback

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    // Limpieza: remover el listener al desmontar
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]); // El listener depende de la función handleScroll

  // ---------------------------------

  // Productos a mostrar basados en visibleCount
  const currentGroups = uniqueGroups.slice(0, visibleCount);

  // --- Funciones existentes (handleButtonClick, handleEdit, handleDelete) sin cambios ---
  const handleButtonClick = (product) => {
    navigate(`/product/${product.id_product}`);
  };

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
        // Optimista: Actualiza UI antes de confirmar backend (opcional)
        // O espera a que la acción termine y actualice el estado global
        dispatch(deleteProduct(id_product)).then(() => {
             Swal.fire("¡Eliminado!", "El producto ha sido eliminado.", "success");
             // Podrías necesitar forzar recarga o confiar en que el estado se actualiza
             // setVisibleCount(initialLoadCount); // Opcional: resetear vista
        }).catch(err => {
             Swal.fire("Error", "No se pudo eliminar el producto.", "error");
        });
      }
    });
  };
  // ------------------------------------------------------------------------------------

  // --- Renderizado ---
  if (loading && products.length === 0) { // Muestra loading solo en la carga inicial
    return (
      <div className="min-h-screen flex items-center justify-center">
        Cargando...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Error: {error}
      </div>
    );
  }

  return (
    <>
      <Navbar />
      {/* Ajusta padding si es necesario */}
      <div className="min-h-screen flex flex-col items-center bg-colorBeige opacity-95 pt-24 pb-10">
        <SearchComponent />
        <div className="mx-auto max-w-7xl w-full px-4 py-16 sm:px-6 lg:px-8">
          {uniqueGroups.length === 0 && !loading ? ( // Muestra si no hay productos y no está cargando
            <p className="text-center text-gray-500 text-lg">No hay productos disponibles.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 uppercase font-nunito font-semibold">
                {/* Mapea sobre currentGroups (los visibles) */}
                {currentGroups.map((group) => {
                  const representative = group[0];
                  return (
                    <div
                      key={representative.id_product} // Usa ID único
                      className="group relative bg-colorBeigeClaro shadow-2xl rounded-2xl overflow-hidden flex flex-col"
                    >
                      {/* ... (contenido de la tarjeta del producto - sin cambios) ... */}
                       {representative.stock <= 5 && (
                        <div className="absolute top-2 left-2 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          ¡Últimas {representative.stock} unidades!
                        </div>
                      )}
                      <div className="w-full h-96 bg-gray-100 overflow-hidden">
                        <Link
                          to={`/product/${representative.id_product}`}
                          state={{ group }}
                        >
                          <img
                            src={
                              representative.images &&
                              representative.images.length > 0
                                ? representative.images[0]
                                : "https://via.placeholder.com/300"
                            }
                            alt={representative.description || "Producto sin nombre"}
                            className="h-full w-full object-cover object-center transition-all duration-500 ease-in-out transform hover:scale-110"
                          />
                        </Link>
                      </div>
                      <div className="flex flex-col justify-between p-6 flex-grow">
                        <h3 className="text-2xl font-semibold font-nunito text-stone-700">
                          <Link
                            to={`/product/${representative.id_product}`}
                            state={{ group }}
                            className="hover:text-amber-100"
                          >
                            {representative.description}
                          </Link>
                        </h3>
                        <div className="text-2xl font-bold text-white">
                          {new Intl.NumberFormat("es-CO", {
                            style: "currency",
                            currency: "COP",
                            minimumFractionDigits: 0,
                          }).format(representative.priceSell)}
                        </div>
                        <p
                          className={`text-sm mt-2 ${
                            representative.stock <= 5
                              ? "text-red-500"
                              : "text-red-600"
                          }`}
                        >
                          Stock disponible: {representative.stock} unidades
                        </p>
                        <div className="mt-4 mb-4 flex justify-between items-center">
                          <button
                            onClick={() =>
                              navigate(`/product/${representative.id_product}`, { state: { group } })
                            }
                            className="mt-4 flex items-center justify-center w-full bg-amber-100 opacity-85 text-slate-700 py-2 px-4 rounded-lg hover:bg-amber-200 transition-colors duration-300"
                          >
                            <FiShoppingCart className="mr-2 text-slate-700" /> Añadir al carrito
                          </button>
                        </div>
                      </div>
                      {userInfo && userInfo.role === "Admin" && (
                        <div className="absolute top-2 right-2 flex space-x-2">
                          <button
                            className="bg-gray-100 text-gray-700 p-2 rounded-full hover:bg-gray-200"
                            onClick={() => handleEditProduct(representative.id_product)}
                          >
                            <FiEdit size={20} />
                          </button>
                          <button
                            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-700"
                            onClick={() => handleDeleteProduct(representative.id_product)}
                          >
                            <FiTrash size={20} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Indicador de carga al hacer scroll */}
              {isLoadingMore && (
                <div className="text-center py-4 text-gray-500">
                  Cargando más productos...
                </div>
              )}
              {/* Mensaje cuando no hay más productos por cargar */}
              {visibleCount >= uniqueGroups.length && uniqueGroups.length > 0 && !isLoadingMore && (
                 <div className="text-center py-4 text-gray-400">
                   Has llegado al final.
                 </div>
              )}
              {/* --- Eliminar la sección de botones de paginación --- */}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductsList;