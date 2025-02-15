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

  // Mostrar productos filtrados si existen, de lo contrario, mostrar todos
  const activeProducts = (searchResults.length > 0 ? searchResults : products)
    .filter(product => product.stock > 0 && product.tiendaOnLine === true); // Filtra por stock y tiendaOnLine

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = activeProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
      <div className="min-h-screen flex flex-col justify-center items-center bg-colorBeige opacity-95 py-14">
        <SearchComponent />
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          {activeProducts.length === 0 ? (
            <p className="text-white text-lg">No hay productos disponibles.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 uppercase font-nunito font-semibold">
                {currentProducts.map((product) => (
                  <div
                    key={product.id_product}
                    className="group relative bg-colorBeigeClaro shadow-2xl rounded-2xl overflow-hidden flex flex-col"
                  >
                    {/* Stock badge */}
                    {product.stock <= 5 && (
                      <div className="absolute top-2 left-2 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        ¡Últimas {product.stock} unidades!
                      </div>
                    )}

                    {/* Contenedor de la imagen */}
                    <div className="w-full h-96 bg-gray-100 overflow-hidden">
                      <Link to={`/product/${product.id_product}`}>
                        <img
                          src={
                            product.Images.length > 0
                              ? product.Images[0].url
                              : "https://via.placeholder.com/300"
                          }
                          alt={product.description || "Producto sin nombre"}
                          className="h-full w-full object-cover object-center transition-all duration-500 ease-in-out transform hover:scale-110"
                        />
                      </Link>
                    </div>

                    {/* Contenedor de texto */}
                    <div className="flex flex-col justify-between p-6 flex-grow">
                      <h3 className="text-2xl font-semibold font-nunito text-stone-700">
                        <Link
                          to={`/product/${product.id_product}`}
                          className="hover:text-amber-100"
                        >
                          {product.description}
                        </Link>
                      </h3>
                      <p className="text-lg font-semibold font-nunito text-gray-800">
                        ${product.priceSell}
                      </p>
                      
                      {/* Stock indicator */}
                      <p className={`text-sm mt-2 ${
                        product.stock <= 5 ? 'text-red-500' : 'text-amber-100'
                      }`}>
                        Stock disponible: {product.stock} unidades
                      </p>

                      <div className="mt-4 mb-4 flex justify-between items-center">
                        <button
                          onClick={() => handleButtonClick(product)}
                          className="mt-4 flex items-center justify-center w-full bg-amber-100 opacity-85 text-slate-700 py-2 px-4 rounded-lg hover:bg-amber-200 transition-colors duration-300"
                        >
                          <FiShoppingCart className="mr-2 text-slate-700" />{" "}
                          Añadir al carrito
                        </button>
                      </div>
                    </div>

                    {/* Botones de administración */}
                    {userInfo && userInfo.role === "Admin" && (
                      <div className="absolute top-2 right-2 flex space-x-2">
                        <button
                          className="bg-gray-100 text-gray-700 p-2 rounded-full hover:bg-gray-200"
                          onClick={() => handleEditProduct(product.id_product)}
                        >
                          <FiEdit size={20} />
                        </button>
                        <button
                          className="bg-red-500 text-white p-2 rounded-full hover:bg-red-700"
                          onClick={() => handleDeleteProduct(product.id_product)}
                        >
                          <FiTrash size={20} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-center mt-8">
                {Array.from({ length: Math.ceil(activeProducts.length / productsPerPage) }, (_, i) => i + 1).map(pageNumber => (
                  <button
                    key={pageNumber}
                    onClick={() => paginate(pageNumber)}
                    className={`mx-1 px-3 py-1 rounded-md ${currentPage === pageNumber ? 'bg-amber-100 text-slate-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    {pageNumber}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductsList;