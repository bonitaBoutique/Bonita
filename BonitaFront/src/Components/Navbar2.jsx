import React from 'react';
import { Disclosure, Menu } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
//import logo from '../assets/img/logoNombre.png';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../Redux/Actions/actions';
import FixedLogo from './FixedLogo';
const navigation = [
  { name: 'Tienda', href: '/products' },
  { name: 'Volver', href: '/panelGeneral' },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar2() {
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.userLogin.userInfo);

  console.log("userInfo:", userInfo);

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
              <button
                onClick={() => dispatch(logout())}
                className={classNames(
                  active ? 'bg-gray-100' : '',
                  'block w-full text-left px-4 py-2 text-sm text-gray-700'
                )}
              >
                Salir
              </button>
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
                  'block px-4 py-2 text-sm text-gray-700'
                )}
              >
                Caja
              </Link>
            )}
          </Menu.Item>
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
                to="/panelGeneral"
                className={classNames(
                  active ? 'bg-gray-100' : '',
                  'block px-4 py-2 text-sm text-gray-700'
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
  {({ active }) => {
    let linkText = "Crear Administrador";
    if (userInfo && userInfo.role === 'Admin') {
      linkText = "Crear Administrador";
    } else if (userInfo && userInfo.role === 'Cajero') {
      linkText = "Crear Cliente";
    }

    return (
      <Link
        to="/register"
        className={classNames(
          active ? 'bg-gray-100' : '',
          'block px-4 py-2 text-sm text-gray-700'
        )}
      >
        {linkText}
      </Link>
    );
  }}
</Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={() => dispatch(logout())}
                className={classNames(
                  active ? 'bg-gray-100' : '',
                  'block w-full text-left px-4 py-2 text-sm text-gray-700'
                )}
              >
                Salir
              </button>
            )}
          </Menu.Item>
        </>
      );
    }
  };

  return (
    <Disclosure as="nav" className="bg-white fixed top-0 left-0 w-full z-50 shadow-md">
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Logo */}
              <div className="flex-shrink-0">
              <div >
                
                <FixedLogo/>
          
            </div>
              </div>

              {/* Navigation Links (Desktop) */}
              <div className="hidden sm:flex sm:items-center sm:space-x-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="text-lg font-medium text-gray-600 hover:text-gray-800"
                  >
                    {item.name}
                  </Link>
                ))}
                {/* Dropdown Menu (Desktop) */}
                <Menu as="div" className="relative">
                  <Menu.Button className="text-lg font-medium text-gray-600 hover:text-gray-800">
                    Menú
                  </Menu.Button>
                  <Menu.Items className="absolute right-0 mt-2 w-48 bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                    {renderMenuItems()}
                  </Menu.Items>
                </Menu>
              </div>

              {/* Hamburger Menu (Mobile) */}
              <div className="sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center p-2 text-gray-600 hover:text-gray-800">
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={Link}
                  to={item.href}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-800"
                >
                  {item.name}
                </Disclosure.Button>
              ))}
              {/* Dropdown Menu (Mobile) */}
              <div className="border-t border-gray-200 pt-3">
                <Menu as="div" className="relative">
                  <Menu.Button className="block w-full text-left px-3 py-2 text-gray-600">
                    Menú
                  </Menu.Button>
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
