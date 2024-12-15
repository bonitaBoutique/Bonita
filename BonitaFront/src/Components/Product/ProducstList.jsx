import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProducts,
  fetchFilteredProducts,
  deleteProduct,
} from "../../Redux/Actions/actions";
import { Link, useNavigate } from "react-router-dom";
import { FiShoppingCart, FiEdit, FiTrash } from "react-icons/fi";
import Swal from "sweetalert2";

const ProductsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  const products = useSelector((state) => state.products || []);
  console.log(products);
  const loading = useSelector((state) => state.loading);
  const error = useSelector((state) => state.error);

  const searchTerm = useSelector((state) => state.searchTerm);
  const userInfo = useSelector((state) => state.userLogin?.userInfo);

  useEffect(() => {
    if (searchTerm) {
      dispatch(fetchFilteredProducts(searchTerm));
    } else {
      dispatch(fetchProducts());
    }
  }, [dispatch, searchTerm]);

  const productsInStock = products.filter((product) => product.stock > 0); // Filtrar productos con stock

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = productsInStock.slice(
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

  if (products.length === 0) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-colorBeige py-16">
        <p className="text-white text-lg">No hay productos disponibles.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-colorBeige opacity-95 py-16">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 uppercase font-nunito font-semibold">
          {currentProducts.map((product) => (
            <div key={product.id_product} className="group relative max-w-xs">
              <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden">
                <Link to={`/product/${product.id_product}`}>
                  <img
                    src={
                      product.Images.length > 0
                        ? product.Images[0].url
                        : "https://via.placeholder.com/150"
                    }
                    alt={product.description || "Producto sin nombre"}
                    className="h-full w-full object-cover object-center rounded-lg"
                  />
                </Link>
              </div>
              <div className="mt-4 px-4">
                <h3 className="text-2xl font-semibold font-nunito text-stone-700">
                  <Link to={`/product/${product.id_product}`}>
                    {product.marca}
                  </Link>
                </h3>
                <p className="text-lg font-semibold font-nunito text-gray-800">
                  ${product.price}
                </p>
              </div>
              <div className="mt-4 mb-4 px-4 flex justify-between items-center">
                <button
                  onClick={() => handleButtonClick(product)}
                  className="mt-4 flex items-center justify-center w-full bg-amber-100 opacity-80 border-2 font-nunito font-semibold text-gray-700 py-2 px-4 rounded-lg hover:bg-amber-200 transition-colors duration-300"
                >
                  <FiShoppingCart className="mr-2 text-colorFooter" /> Añadir al
                  carrito
                </button>
              </div>
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

        {/* Paginación */}
        <div className="mt-8 flex justify-center">
          <nav className="block">
            <ul className="flex pl-0 rounded list-none flex-wrap">
              {Array.from(
                { length: Math.ceil(productsInStock.length / productsPerPage) },
                (_, i) => (
                  <li key={i}>
                    <button
                      className={`${
                        currentPage === i + 1
                          ? "bg-rose-300 text-white hover:bg-rose-400"
                          : "bg-rose-300 text-gray-200 hover:bg-rose-400"
                      } px-3 py-2 ml-1 rounded`}
                      onClick={() => paginate(i + 1)}
                    >
                      {i + 1}
                    </button>
                  </li>
                )
              )}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default ProductsList;
