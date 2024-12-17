import React, { useEffect, useState } from 'react';
import { Disclosure, Menu } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/img/logoNombre.png';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchTerm, fetchFilteredProducts, fetchCategories, logout } from '../Redux/Actions/actions';

const navigation = [
  { name: 'Tienda', href: '/products', current: true },
 
  { name: 'Contactanos', href: '#footer', current: false },
 
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
  const [isTransparent, setIsTransparent] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate(); 
  const searchTerm = useSelector(state => state.searchTerm);
  const userInfo = useSelector(state => state.userLogin.userInfo);

  useEffect(() => {
    dispatch(fetchCategories());

    const handleScroll = () => {
      setIsTransparent(window.scrollY <= 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dispatch]);

  const handleSearchChange = (event) => {
    dispatch(setSearchTerm(event.target.value));
    dispatch(fetchFilteredProducts(event.target.value));
  };

  const renderMenuItems = () => {
    if (!userInfo) {
      return (
        <>
          <Menu.Item>
            {({ active }) => (
              <Link to="/login" className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm')}>
                Ingresar
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <Link to="/register" className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm')}>
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
              <Link to={`/myOrders/${userInfo.n_document}`} className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm')}>
                Mis Pedidos
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <Link to="/" onClick={() => dispatch(logout())} className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm')}>
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
              <Link to="/allOrders" className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm')}>
                Pedidos
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/panelProductos"
                className={classNames(
                  active ? 'bg-gray-100' : '',
                  'block px-4 py-2 text-sm text-gray-700'
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
              <Link to="/" onClick={() => dispatch(logout())} className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm')}>
                Salir
              </Link>
            )}
          </Menu.Item>
          
        </>
      );
    }
  };

  return (
    <Disclosure as="nav" className={`fixed top-0 left-0 w-full z-50 ${isTransparent ? 'bg-transparent' : 'bg-white'} transition-colors duration-300`}>
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex-shrink-0">
                <Link to="/">
                  <img className={`object-contain ${open ? 'h-16' : 'h-14'} transition-all`} src={logo} alt="Logo" />
                </Link>
              </div>

              <div className="hidden sm:flex sm:items-center sm:space-x-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`text-lg font-medium ${isTransparent ? 'text-white' : 'text-slate-900'} hover:text-slate-600`}
                  >
                    {item.name}
                  </Link>
                ))}
                <input type="text" placeholder="Buscar productos" value={searchTerm} onChange={handleSearchChange} className="hidden lg:block px-3 py-2 border rounded-md" />
                <Link to="/cart" className={`${isTransparent ? 'text-white' : 'text-slate-900'}`}>
                  <ShoppingBagIcon className="h-6 w-6" />
                </Link>
                <Menu as="div" className="relative">
                  <Menu.Button className={`${isTransparent ? 'text-white' : 'text-slate-900'}`}>Menu</Menu.Button>
                  <Menu.Items className="absolute right-0 mt-2 w-48 bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                    {renderMenuItems()}
                  </Menu.Items>
                </Menu>
              </div>

              <div className="sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center p-2">
                  {open ? <XMarkIcon className={`${isTransparent ? 'text-white' : 'text-slate-900'} h-6 w-6`} /> : <Bars3Icon className={`${isTransparent ? 'text-white' : 'text-slate-900'} h-6 w-6`} />}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => (
                <Disclosure.Button key={item.name} as={Link} to={item.href} className="block px-3 py-2 rounded-md text-base font-medium">
                  {item.name}
                </Disclosure.Button>
              ))}
              <input type="text" placeholder="Buscar productos" value={searchTerm} onChange={handleSearchChange} className="w-full px-3 py-2 border rounded-md" />
              <div className="border-t border-gray-200 pt-3">
                <Menu as="div" className="relative">
                  <Menu.Button className="block w-full text-left px-3 py-2">Menú</Menu.Button>
                  <Menu.Items className="absolute right-0 mt-2 w-full bg-white shadow-lg">
                    {renderMenuItems()}
                  </Menu.Items>
                </Menu>
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
