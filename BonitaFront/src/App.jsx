import React, { Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import ErrorBoundary from './Components/routes/error/ErrorBoundary';
import ProtectedRoute from './Components/routes/ProtectedRoute/ProtectedRoute';
import Loading from './Components/Loading';
import Footer from './Components/Footer';
import CartButton from './Components/CartButton';
import WhatsappButton from './Components/WhatsappButton';
import FixedLogo from './Components/FixedLogo';
import { 
  publicRoutes, 
  privateRoutes, 
  adminRoutes, 
  cashierRoutes,
  adminPaths 
} from './Components/routes/routeDefinitions';

function App() {
  const location = useLocation();

  const isAdminRoute = (pathname) => {
    return adminPaths.some(path => pathname.startsWith(path));
  };

  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        <div>
          <FixedLogo />
          <Routes>
            {/* Rutas públicas */}
            {publicRoutes.map(({ path, component: Component, exact }) => (
              <Route 
                key={path} 
                path={path} 
                exact={exact} 
                element={<Component />} 
              />
            ))}

            {/* Rutas privadas */}
            {privateRoutes.map(({ path, component: Component }) => (
              <Route
                key={path}
                path={path}
                element={
                  <ProtectedRoute>
                    <Component />
                  </ProtectedRoute>
                }
              />
            ))}

            {/* Rutas de administrador */}
            {adminRoutes.map(({ path, component: Component }) => (
              <Route
                key={path}
                path={path}
                element={
                  <ProtectedRoute requiredRole="Admin">
                    <Component />
                  </ProtectedRoute>
                }
              />
            ))}

            {/* Rutas de cajero */}
            {cashierRoutes.map(({ path, component: Component }) => (
              <Route
                key={path}
                path={path}
                element={
                  <ProtectedRoute requiredRole="AdminCajero">
                    <Component />
                  </ProtectedRoute>
                }
              />
            ))}
          </Routes>
        </div>

        {/* Componentes condicionales basados en la ruta */}
        {!isAdminRoute(location.pathname) && (
          <>
            <Footer />
            <CartButton />
            <WhatsappButton />
          </>
        )}
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
