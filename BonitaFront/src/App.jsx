import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ErrorBoundary from './Components/routes/error/ErrorBoundary';
import ProtectedRoute from './Components/routes/ProtectedRoute/ProtectedRoute';
import Loading from './Components/Loading';
import Footer from './Components/Footer';
import CartButton from './Components/CartButton';
import WhatsappButton from './Components/WhatsappButton';
import FixedLogo from './Components/FixedLogo';
import PromoPopup from './Components/Promotions/PromoPopup';
import { fetchActivePromotion } from './Redux/promotionSlice';

import { 
  publicRoutes, 
  privateRoutes, 
  adminRoutes, 
  cashierRoutes,
  adminPaths 
} from './Components/routes/routeDefinitions';

function App() {
  const location = useLocation();
  const dispatch = useDispatch();
  const activePromotion = useSelector((state) => state.promotions?.activePromotion);

  // ✅ Cargar promoción activa al montar la app
  useEffect(() => {
    console.log('🎯 App.jsx - Llamando a fetchActivePromotion...');
    dispatch(fetchActivePromotion());
  }, [dispatch]);

  // ✅ Debug: Mostrar en consola cuando cambia la promoción activa
  useEffect(() => {
    console.log('🎉 PROMOCIÓN ACTIVA EN APP:', activePromotion);
  }, [activePromotion]);

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
                    <Suspense fallback={<Loading />}>
                      {React.createElement(Component)}
                    </Suspense>
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
                    <Suspense fallback={<Loading />}>
                      {React.createElement(Component)}
                    </Suspense>
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
                    <Suspense fallback={<Loading />}>
                      {React.createElement(Component)}
                    </Suspense>
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
            {/* <CartButton /> */}
            <WhatsappButton />
          </>
        )}

        {/* ✅ Popup de promoción (se muestra en todas las páginas cuando hay promo activa) */}
        <PromoPopup />
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
