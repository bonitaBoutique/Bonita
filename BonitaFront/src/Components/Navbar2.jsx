import React, { useEffect } from 'react';
import { Disclosure, Menu } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../Redux/Actions/actions';
import FixedLogo from './FixedLogo';

const navigation = [
  { 
    name: 'Tienda', 
    href: '/products',
    showOnRoot: true 
  },
  { 
    name: 'Volver', 
    href: '/panelGeneral',
    showOnRoot: false 
  }
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar2() {
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.userLogin.userInfo);
  const location = useLocation();
  
  const isRootPath = location.pathname === '/';
  const filteredNavigation = navigation.filter(item => !isRootPath || item.showOnRoot);

  useEffect(() => {
    console.log('UserInfo cambió:', {
      userInfo,
      role: userInfo?.role,
      isLoggedIn: !!userInfo
    });
  }, [userInfo]);

  const renderPublicMenu = () => (
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

  const renderUserMenu = () => (
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

  const renderAdminCajeroMenu = () => {
    const isAdmin = userInfo.role === 'Admin';
    
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
        
        {isAdmin && (
          <>
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
          </>
        )}
        
        <Menu.Item>
          {({ active }) => (
            <Link
              to="/register"
              className={classNames(
                active ? 'bg-gray-100' : '',
                'block px-4 py-2 text-sm text-gray-700'
              )}
            >
              {userInfo.role === 'Cajero' ? "Crear Cliente" : "Crear Administrador"}
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
  };

  const renderMenuItems = () => {
    if (!userInfo) return renderPublicMenu();
    if (userInfo.role === 'User') return renderUserMenu();
    if (['Admin', 'Cajero'].includes(userInfo.role)) return renderAdminCajeroMenu();
    return null;
  };

  return (
    <Disclosure as="nav" className="bg-white fixed top-0 left-0 w-full z-50 shadow-md">
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex-shrink-0">
                <FixedLogo />
              </div>

              <div className="hidden sm:flex sm:items-center sm:space-x-6">
                {!isRootPath && filteredNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="text-lg font-medium text-gray-600 hover:text-gray-800"
                  >
                    {item.name}
                  </Link>
                ))}
                {!isRootPath && (
                  <Menu as="div" className="relative">
                    <Menu.Button className="text-lg font-medium text-gray-600 hover:text-gray-800">
                      Menú
                    </Menu.Button>
                    <Menu.Items className="absolute right-0 mt-2 w-48 bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                      {renderMenuItems()}
                    </Menu.Items>
                  </Menu>
                )}
              </div>

              {!isRootPath && (
                <div className="sm:hidden">
                  <Disclosure.Button className="inline-flex items-center justify-center p-2 text-gray-600 hover:text-gray-800">
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              )}
            </div>
          </div>

          {!isRootPath && (
            <Disclosure.Panel className="sm:hidden">
              <div className="space-y-1 px-2 pb-3 pt-2">
                {filteredNavigation.map((item) => (
                  <Disclosure.Button
                    key={item.name}
                    as={Link}
                    to={item.href}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-800"
                  >
                    {item.name}
                  </Disclosure.Button>
                ))}
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
          )}
        </>
      )}
    </Disclosure>
  );
}