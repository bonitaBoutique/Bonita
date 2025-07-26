import React, { useEffect, useState } from 'react';
import { Disclosure, Menu } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
//import logo from '../assets/img/logoNombre.png';
import FixedLogo from './FixedLogo';
import { useDispatch, useSelector } from 'react-redux';
import {  logout } from '../Redux/Actions/actions';

const navigation = [
  { name: "Tienda", href: "/products", isScroll: false },
  { name: "Contactanos", href: "#footer", isScroll: true },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
  const [isTransparent, setIsTransparent] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate(); 
  // const searchTerm = useSelector(state => state.searchTerm);
  const userInfo = useSelector(state => state.userLogin.userInfo);

  useEffect(() => {
    const handleScroll = () => {
      setIsTransparent(window.scrollY <= 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dispatch]);

  const handleScrollToFooter = () => {
    const footerElement = document.getElementById("footer");
    if (footerElement) {
      footerElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Función para renderizar items de escritorio (mantiene Menu.Item)
  const renderMenuItems = () => {
    if (!userInfo) {
      return (
        <>
          <Menu.Item>
            {({ active }) => (
              <Link to="/login" className={classNames(active ? 'bg-gray-200' : '', 'block px-4 py-2 text-sm text-gray-700 hover:text-gray-900')}>
                Ingresar
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <Link to="/register" className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700 hover:text-gray-900')}>
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
              <Link to={`/myOrders/${userInfo.n_document}`} className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700 hover:text-gray-900')}>
                Mis Pedidos
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <Link to="/" onClick={() => dispatch(logout())} className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700 hover:text-gray-900')}>
                Salir
              </Link>
            )}
          </Menu.Item>
        </>
      );
    } else if (userInfo.role === 'Admin' || userInfo.role === 'Cajero') {
      return (
        <>
         <Menu.Item>
            {({ active }) => (
              <Link
                to="/panel/caja"
                className={classNames(
                  active ? 'bg-gray-100' : '',
                  'block px-4 py-2 text-sm text-gray-700 hover:text-gray-900'
                )}
              >
                Caja
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <Link to="/allOrders" className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700 hover:text-gray-900')}>
                Pedidos
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/panelGeneral"
                className={classNames(
                  active ? 'bg-gray-100' : '',
                  'block px-4 py-2 text-sm text-gray-700 hover:text-gray-900'
                )}
              >
                Panel General
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/panelProductos"
                className={classNames(
                  active ? 'bg-gray-100' : '',
                  'block px-4 py-2 text-sm text-gray-700 hover:text-gray-900'
                )}
              >
                Panel Productos
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/panel"
                className={classNames(
                  active ? 'bg-gray-100' : '',
                  'block px-4 py-2 text-sm text-gray-700 hover:text-gray-900'
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
                  'block px-4 py-2 text-sm text-gray-700 hover:text-gray-900'
                )}
              >
                Crear Administrador
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <Link to="/" onClick={() => dispatch(logout())} className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700 hover:text-gray-900')}>
                Salir
              </Link>
            )}
          </Menu.Item>
        </>
      );
    }
  };

  // Nueva función para renderizar items móviles (usa Disclosure.Button)
  const renderMobileMenuItems = () => {
    if (!userInfo) {
      return (
        <>
          <Disclosure.Button as="div">
            <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100 transition-colors">
              Ingresar
            </Link>
          </Disclosure.Button>
          <Disclosure.Button as="div">
            <Link to="/register" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100 transition-colors">
              Registrarse
            </Link>
          </Disclosure.Button>
        </>
      );
    } else if (userInfo.role === 'User') {
      return (
        <>
          <Disclosure.Button as="div">
            <Link to={`/myOrders/${userInfo.n_document}`} className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100 transition-colors">
              Mis Pedidos
            </Link>
          </Disclosure.Button>
          <Disclosure.Button as="div">
            <Link to="/" onClick={() => dispatch(logout())} className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100 transition-colors">
              Salir
            </Link>
          </Disclosure.Button>
        </>
      );
    } else if (userInfo.role === 'Admin' || userInfo.role === 'Cajero') {
      return (
        <>
          <Disclosure.Button as="div">
            <Link to="/panel/caja" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100 transition-colors">
              Caja
            </Link>
          </Disclosure.Button>
          <Disclosure.Button as="div">
            <Link to="/allOrders" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100 transition-colors">
              Pedidos
            </Link>
          </Disclosure.Button>
          <Disclosure.Button as="div">
            <Link to="/panelGeneral" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100 transition-colors">
              Panel General
            </Link>
          </Disclosure.Button>
          <Disclosure.Button as="div">
            <Link to="/panelProductos" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100 transition-colors">
              Panel Productos
            </Link>
          </Disclosure.Button>
          <Disclosure.Button as="div">
            <Link to="/panel" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100 transition-colors">
              Facturación
            </Link>
          </Disclosure.Button>
          <Disclosure.Button as="div">
            <Link to="/register" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100 transition-colors">
              Crear Administrador
            </Link>
          </Disclosure.Button>
          <Disclosure.Button as="div">
            <Link to="/" onClick={() => dispatch(logout())} className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100 transition-colors">
              Salir
            </Link>
          </Disclosure.Button>
        </>
      );
    }
  };

  return (
    <Disclosure as="nav" className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      isTransparent 
        ? 'bg-white/10 backdrop-blur-md border-b border-white/20' 
        : 'bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm'
    }`}>
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div>
                <FixedLogo/>
              </div>

              <div className="hidden sm:flex sm:items-center sm:space-x-6">
                {navigation.map((item) =>
                  item.isScroll ? (
                    <button
                      key={item.name}
                      className={`text-lg font-medium transition-colors duration-300 ${
                        isTransparent 
                          ? "text-gray-800 hover:text-gray-600" 
                          : "text-gray-900 hover:text-gray-600"
                      }`}
                      onClick={handleScrollToFooter}
                    >
                      {item.name}
                    </button>
                  ) : (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`text-lg font-medium transition-colors duration-300 ${
                        isTransparent 
                          ? "text-gray-800 hover:text-gray-600" 
                          : "text-gray-900 hover:text-gray-600"
                      }`}
                    >
                      {item.name}
                    </Link>
                  )
                )}
                
                {/* Carrito con mejor estilo */}
                <Link 
                  to="/cart" 
                  className={`p-2 rounded-full transition-all duration-300 ${
                    isTransparent 
                      ? 'text-gray-800 hover:bg-white/20' 
                      : 'text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <ShoppingBagIcon className="h-6 w-6" />
                </Link>
                
                {/* Menú mejorado */}
                <Menu as="div" className="relative">
                  <Menu.Button className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isTransparent 
                      ? 'text-gray-800 hover:bg-white/20' 
                      : 'text-gray-900 hover:bg-gray-100'
                  }`}>
                    Menú
                  </Menu.Button>
                  <Menu.Items className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-md shadow-lg ring-1 ring-black/5 rounded-xl border border-gray-200 focus:outline-none">
                    <div className="py-1">
                      {renderMenuItems()}
                    </div>
                  </Menu.Items>
                </Menu>
              </div>

              {/* Menú móvil */}
              <div className="sm:hidden">
                <Disclosure.Button className={`inline-flex items-center justify-center p-2 rounded-lg transition-colors duration-300 ${
                  isTransparent 
                    ? 'text-gray-800 hover:bg-white/20' 
                    : 'text-gray-900 hover:bg-gray-100'
                }`}>
                  {open ? (
                    <XMarkIcon className="h-6 w-6" />
                  ) : (
                    <Bars3Icon className="h-6 w-6" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          {/* Panel móvil mejorado */}
          <Disclosure.Panel className="sm:hidden bg-white/95 backdrop-blur-md border-t border-gray-200">
            <div className="space-y-1 px-4 pb-3 pt-2">
              {navigation.map((item) => (
                item.isScroll ? (
                  <Disclosure.Button
                    key={item.name}
                    as="button"
                    onClick={handleScrollToFooter}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100 transition-colors"
                  >
                    {item.name}
                  </Disclosure.Button>
                ) : (
                  <Disclosure.Button
                    key={item.name}
                    as="div"
                    className="block"
                  >
                    <Link 
                      to={item.href} 
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </Disclosure.Button>
                )
              ))}
              
              {/* Carrito en móvil */}
              <Disclosure.Button as="div" className="block">
                <Link 
                  to="/cart" 
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  <ShoppingBagIcon className="h-5 w-5 mr-2" />
                  Carrito
                </Link>
              </Disclosure.Button>
              
              {/* Menú usuario en móvil - CORREGIDO */}
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="space-y-1">
                  {renderMobileMenuItems()}
                </div>
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}