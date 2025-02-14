import { Link, useLocation } from 'react-router-dom';
import imgLogo from '../assets/img/bannerCompras.png';
import { adminPaths } from './routes/routeDefinitions';

const CartButton = () => {
  const location = useLocation();

  // Verificar si estamos en una ruta administrativa
  const isAdminRoute = adminPaths.some(path => 
    location.pathname.startsWith(path)
  );

  // No renderizar el botón en rutas administrativas
  if (isAdminRoute) {
    return null;
  }

  return (
    <Link
      to="/products"
      className="fixed top-44 right-2 transition duration-300 transform hover:scale-100 hover:animate-bounce z-50 md:bottom-8 md:-right-6"
    >
      <img 
        src={imgLogo} 
        alt="Carrito de compras"
        className="w-24 h-24 md:w-48 md:h-48" 
      />
    </Link>
  );
};

export default CartButton;
