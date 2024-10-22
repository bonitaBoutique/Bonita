import React, { useEffect, useState } from 'react';
import { Disclosure, Menu } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, MagnifyingGlassIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom'; // Agrega useNavigate para la redirección
import logo from '../assets/img/logoNombre.png';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchTerm, fetchFilteredProducts, setPriceFilter, setCategoryFilter, fetchCategories, logout } from '../Redux/Actions/actions';

const navigation = [
  { name: 'Tienda', href: '/products', current: true },
  { name: 'Colecciones', href: '#about', current: false },
  { name: 'Contactanos', href: '#footer', current: false },
  { name: 'Ofertas', href: '#', current: false },
  
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
  const [isTransparent, setIsTransparent] = useState(true);
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate(); 
  const searchTerm = useSelector(state => state.searchTerm);
  const priceFilter = useSelector(state => state.priceFilter);
  const categoryFilter = useSelector(state => state.categoryFilter);
  const categories = useSelector(state => state.categories.data);
  const userInfo = useSelector(state => state.userLogin.userInfo);

 
  
  const publicRoutes = ['/login', '/', '/register', '/products', '/productsCat/:categoryName', '/caballeros', '/cart'];

  useEffect(() => {
    const currentPath = window.location.pathname;

  
    let isPublicRoute = publicRoutes.some(route => {
   
      const routeRegex = new RegExp(`^${route.replace(':categoryName', '[^/]+').replace(':id', '\\d+')}$`);
      return routeRegex.test(currentPath);
    });

   
    if (currentPath.startsWith('/product/')) {
      isPublicRoute = true;
    }

  
    if (!userInfo && !isPublicRoute) {
      navigate('/login');
    }
  }, [userInfo, navigate]);

  useEffect(() => {
    dispatch(fetchCategories());

    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsTransparent(false);
      } else {
        setIsTransparent(true);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [dispatch]);

  const handleSearchChange = (event) => {
    dispatch(setSearchTerm(event.target.value));
    dispatch(fetchFilteredProducts(event.target.value, priceFilter, categoryFilter));
  };

  const handlePriceChange = (event) => {
    const priceRange = event.target.value.split('-').map(Number);
    dispatch(setPriceFilter({ min: priceRange[0], max: priceRange[1] }));
    dispatch(fetchFilteredProducts(searchTerm, { min: priceRange[0], max: priceRange[1] }, categoryFilter));
  };

  const handleCategoryChange = (event) => {
    dispatch(setCategoryFilter(event.target.value));
    dispatch(fetchFilteredProducts(searchTerm, priceFilter, event.target.value));
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const renderMenuItems = () => {
    if (!userInfo) {
      return (
        <>
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/login"
                className={classNames(
                  active ? 'bg-gray-100' : '',
                  'block px-4 py-2 text-sm text-gray-700'
                )}
              >
                Ingresar
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/register"
                className={classNames(
                  active ? 'bg-gray-100' : '',
                  'block px-4 py-2 text-sm text-gray-700'
                )}
              >
                Registrarse
              </Link>
            )}
          </Menu.Item>
          
        </>
      );
    } else if (userInfo.role === 'User') {
      return (
        <>
          <Menu.Item>
            {({ active }) => (
              <Link
                to={`/myOrders/${userInfo.n_document}`}
                className={classNames(
                  active ? 'bg-gray-100' : '',
                  'block px-4 py-2 text-sm text-gray-700'
                )}
              >
                Mis Pedidos
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/header"
                onClick={handleLogout}
                className={classNames(
                  active ? 'bg-gray-100' : '',
                  'block px-4 py-2 text-sm text-gray-700'
                )}
              >
                Salir
              </Link>
            )}
          </Menu.Item>
        </>
      );
    } else if (userInfo.role === 'Admin') {
      return (
        <>
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/allOrders"
                className={classNames(
                  active ? 'bg-gray-100' : '',
                  'block px-4 py-2 text-sm text-gray-700'
                )}
              >
                Pedidos
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/createProducts"
                className={classNames(
                  active ? 'bg-gray-100' : '',
                  'block px-4 py-2 text-sm text-gray-700'
                )}
              >
                Crear Productos
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/facturacion"
                className={classNames(
                  active ? 'bg-gray-100' : '',
                  'block px-4 py-2 text-sm text-gray-700'
                )}
              >
                Facturación
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/register"
                className={classNames(
                  active ? 'bg-gray-100' : '',
                  'block px-4 py-2 text-sm text-gray-700'
                )}
              >
                Crear Administrador
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/category"
                className={classNames(
                  active ? 'bg-gray-100' : '',
                  'block px-4 py-2 text-sm text-gray-700'
                )}
              >
                Nueva Categoría
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/sb"
                className={classNames(
                  active ? 'bg-gray-100' : '',
                  'block px-4 py-2 text-sm text-gray-700'
                )}
              >
                Nueva SubCategoría
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/"
                onClick={handleLogout}
                className={classNames(
                  active ? 'bg-gray-100' : '',
                  'block px-4 py-2 text-sm text-gray-700'
                )}
              >
                Salir
              </Link>
            )}
          </Menu.Item>
        </>
      );
    }
  };

  return (
    <Disclosure as="nav" className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 text-white ${isTransparent ? 'bg-transparent text-white' : 'bg-colorFooter text-white'} `}>
      <div className="max-w-full px-2 sm:px-4  lg:px-8 py-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/">
              <img
                alt="Your Company"
                src={logo}
              className="h-52 w-auto object-contain" 
              />
            </Link>
          </div>

          {/* Enlaces de navegación para pantallas grandes */}
          <div className="hidden sm:flex flex-1 justify-center space-x-8">
            {navigation.map((item) => (
          <a
                key={item.name}
            href={item.href} // Usa <a> para enlaces de anclaje
            className={`text-xl font-medium text-white ${item.current ? 'text-gray-200' : 'text-gray-700 hover:text-gray-400'}`}
            aria-current={item.current ? 'page' : undefined}
              >
                {item.name}
          </a>
            ))}
          </div>

          {/* Search bar */}
          <div className="flex-1 flex justify-center px-2 lg:ml-6 lg:mr-6">
            <div className="relative w-full max-w-lg">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                placeholder="Buscar productos"
                value={searchTerm}
                onChange={handleSearchChange}
                className="block w-1/2 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-transparent text-gray-200 placeholder-gray-200 focus:outline-none focus:ring-0 sm:text-sm"
              />
            </div>
          </div>

          {/* Iconos de carrito y menú móvil */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <Link to="/cart" className="relative p-2 text-gray-200 hover:text-gray-400">
              <ShoppingBagIcon className="h-8 w-8" aria-hidden="true" />
            </Link>

            {/* User dropdown */}
            <Menu as="div" className="relative ml-3">
              <Menu.Button className="bg-transparent text-white px-3 py-2 rounded-md text-xl font-medium">
                Menu
                </Menu.Button>
              <Menu.Items className="absolute right-0 z-10 mt-2 w-48 py-1 bg-white text-gray-900 rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                {renderMenuItems()}
              </Menu.Items>
            </Menu>
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="-mr-2 flex sm:hidden">
          <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
            <span className="sr-only">Abrir menú</span>
            {open ? (
              <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
            ) : (
              <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
            )}
          </Disclosure.Button>
        </div>
      </div>

      {/* Mobile navigation */}
      <Disclosure.Panel className="sm:hidden">
        <div className="space-y-1 px-2 pt-2 pb-3">
          {navigation.map((item) => (
            <Disclosure.Button
              key={item.name}
              as={Link}
              to={item.href}
              className={`block px-3 py-2 rounded-md text-base font-medium ${item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
            >
              {item.name}
            </Disclosure.Button>
          ))}
        </div>
      </Disclosure.Panel>
    </Disclosure>
  );
}
