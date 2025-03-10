import { useEffect, useState } from "react";
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

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 6;
  const maxPagesToShow = 5;

  // Selecciona los datos del estado global
  const products = useSelector((state) => state.products || []);
  const searchResults = useSelector((state) => state.searchResults || []);
  const loading = useSelector((state) => state.loading);
  const error = useSelector((state) => state.error);
  const userInfo = useSelector((state) => state.userLogin?.userInfo);

  useEffect(() => {
    // Cargar todos los productos al inicio
    dispatch(fetchProducts());
  }, [dispatch]);

  // Mostrar productos filtrados si existen, de lo contrario, mostrar todos.
  // Filtramos por stock y que sea tiendaOnLine.
  const activeProducts = (searchResults.length > 0 ? searchResults : products).filter(
    (product) => product.stock > 0 && product.tiendaOnLine === true
  );

  // Agrupamos productos por descripción para mostrar solo uno por grupo.
  const groupedProducts = {};
activeProducts.forEach((product) => {
  // Normalizamos la descripción usando trim() (y opcionalmente toUpperCase())
  const key = product.description.trim();
  if (groupedProducts[key]) {
    groupedProducts[key].push(product);
  } else {
    groupedProducts[key] = [product];
  }
});

  // Convertimos el objeto en un arreglo donde cada elemento es un grupo (array) de productos con la misma descripción.
  const uniqueGroups = Object.values(groupedProducts);

  // Para la paginación, usamos uniqueGroups y mostramos el primer producto de cada grupo.
  const indexOfLastGroup = currentPage * productsPerPage;
  const indexOfFirstGroup = indexOfLastGroup - productsPerPage;
  const currentGroups = uniqueGroups.slice(indexOfFirstGroup, indexOfLastGroup);

  const getPageNumbers = () => {
    const totalPages = Math.ceil(uniqueGroups.length / productsPerPage);
    if (totalPages <= maxPagesToShow) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    const pageNumbers = Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );

    if (startPage > 1) {
      pageNumbers.unshift(1);
      if (startPage > 2) {
        pageNumbers.unshift("...");
      }
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push("...");
      }
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleButtonClick = (product) => {
    // Navega a la vista de detalles donde se podrán mostrar todas las variantes.
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
        dispatch(deleteProduct(id_product));
        Swal.fire("¡Eliminado!", "El producto ha sido eliminado.", "success");
      }
    });
  };

  if (loading) {
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
      <div className="min-h-screen flex flex-col justify-center items-center bg-colorBeige opacity-95 py-40">
        <SearchComponent />
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          {uniqueGroups.length === 0 ? (
            <p className="text-white text-lg">No hay productos disponibles.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 uppercase font-nunito font-semibold">
                {currentGroups.map((group, index) => {
                  const representative = group[0]; // El primero representará al grupo.
                  return (
                    <div
                      key={representative.id_product}
                      className="group relative bg-colorBeigeClaro shadow-2xl rounded-2xl overflow-hidden flex flex-col"
                    >
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
              <div className="flex justify-center mt-8 w-full overflow-x-auto">
                <div className="flex space-x-1">
                  <button
                    onClick={() => paginate(1)}
                    disabled={currentPage === 1}
                    className="mx-1 px-2 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                  >
                    {"<<"}
                  </button>
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="mx-1 px-2 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                  >
                    {"<"}
                  </button>
                  {getPageNumbers().map((pageNumber, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        if (typeof pageNumber === "number") {
                          paginate(pageNumber);
                        }
                      }}
                      disabled={typeof pageNumber === "string"}
                      className={`mx-1 px-2 py-1 rounded-md ${
                        currentPage === pageNumber
                          ? "bg-amber-100 text-slate-700"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      } ${typeof pageNumber === "string" ? "cursor-default" : ""}`}
                    >
                      {pageNumber}
                    </button>
                  ))}
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === Math.ceil(uniqueGroups.length / productsPerPage)}
                    className="mx-1 px-2 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                  >
                    {">"}
                  </button>
                  <button
                    onClick={() => paginate(Math.ceil(uniqueGroups.length / productsPerPage))}
                    disabled={currentPage === Math.ceil(uniqueGroups.length / productsPerPage)}
                    className="mx-1 px-2 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                  >
                    {">>"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductsList;
