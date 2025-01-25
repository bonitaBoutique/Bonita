import React, { useState, useEffect } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { useSelector } from 'react-redux';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import CreateProduct from "./Components/Product/CreateProduct";
import PrivateRoute from "./Components/PrivateRoute";

import ProductsList from "./Components/Product/ProducstList";
import ProductDetails from "./Components/Product/ProductDetails";
import Cart from "./Components/Cart";
import Checkout from "./Components/Checkout";
import Register from "./Components/Users/Register";
import Login from "./Components/Users/Login";
import OrdersDetails from "./Components/OrdersDetail";
import OrdersList from "./Components/OrdersList";
import UpdateProduct from "./Components/Product/UpdateProduct";

import Footer from "./Components/Footer";
import CartButton from "./Components/CartButton";


import ThankYouPage from "./Components/ThankYouPage";
//import FilteredProducts from "./Components/Product/FilteredProducts";
import LandingPrincipal from "./Components/LandingPrincipal";
import WhatsappButton from "./Components/WhatsappButton";
import BillingForm from "./Components/Taxxa/BillingForm";
import Invoice from "./Components/Taxxa/Invoice";
import CreditN from "./Components/Taxxa/CreditN";
import SellerForm from "./Components/Taxxa/SellerForm";
import Panel from "./Components/Taxxa/Panel";
import PanelProductos from "./Components/Product/PanelProductos";
import ListadoProductos from "./Components/stock/ListadoProductos";
import OrdenesPendientes from "./Components/Taxxa/OrdenesPendientes";
import Caja from "./Components/Caja";
import PanelGeneral from "./Components/PanelGeneral";
import Recibo from "./Components/Recibo";
import CargarGastos from "./Components/Informes/CargarGastos"
import PanelInformes from "./Components/Informes/PanelInformes"
import FilterExpenses from "./Components/Informes/FilterExpenses";
import Balance from "./Components/Informes/Balance"
import Loading from "./Components/Loading";

import RequestPasswordReset from "./Components/Users/RequestPasswordReset";
import ResetPassword from "./Components/Users/ResetPassword";
import AdminRoute from './Components/AdminRoute';

import AdminCajeroRoute from './Components/AdminCajeroRoute';

function App() {

  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    // Simular tiempo de carga
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  if (isLoading) {
    return <Loading />;
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const location = useLocation();
  const adminRoutes = [
    "/panel",
    "/panelGeneral",
    "/panel/facturacion",
    "/panel/productos",
    "/panel/seller",
    "/panel/ordenesPendientes",
    "/panelProductos",
    "/updateProduct/:id",
    "/panel/createProducts",
    "/invoice",
    "/creditN",
    "/caja/:idOrder",
    "/informes",
    "/createProducts"
  ];

  const isAdminRoute = adminRoutes.some((route) =>
    location.pathname.startsWith(route.replace(/:\w+/g, ""))
  );

  return (
    <>
      <div>
       
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<LandingPrincipal />} />
          <Route exact path="/register" element={<Register />} />
          <Route exact path="/login" element={<Login />} />
          <Route path="/recuperar" element={<RequestPasswordReset />} />
            <Route path="/resetPassword/:token" element={<ResetPassword />} />
          <Route exact path="/products" element={<ProductsList />} />
          <Route exact path="/product/:id" element={<ProductDetails />} />
          <Route exact path="/gracias" element={<ThankYouPage />} />
          <Route
            exact
            path="/myOrders/:n_document"
            element={
              <PrivateRoute>
                <OrdersDetails />
              </PrivateRoute>
            }
          />
          <Route
            exact
            path="/allOrders"
            element={
              <PrivateRoute>
                <OrdersList />
              </PrivateRoute>
            }
          />

          <Route exact path="/cart" element={<Cart />} />
          <Route exact path="/checkout" element={<Checkout />} />
        
          <Route
            path="/updateProduct/:id"
            element={
              <PrivateRoute>
                <UpdateProduct />
              </PrivateRoute>
            }
          />
          <Route
            path="/panel/facturacion"
            element={
              <AdminRoute>
                <BillingForm />
              </AdminRoute>
            }
          />
          <Route
            path="/panel/productos"
            element={
              <AdminRoute>
                <ListadoProductos />
              </AdminRoute>
            }
          />
          <Route
            path="/panel/caja"
            element={
              <AdminCajeroRoute>
                <Caja />
              </AdminCajeroRoute>
            }
          />
          <Route
            path="/receipt/:idOrder"
            element={
              <AdminCajeroRoute>
                <Recibo />
              </AdminCajeroRoute>
            }
          />
          <Route
            path="/panel"
            element={
              <AdminRoute>
                <Panel />
              </AdminRoute>
            }
          />
            <Route
            path="/panelGeneral"
            element={
              <AdminRoute>
                <PanelGeneral />
              </AdminRoute>
            }
          />
          <Route
            path="/panelProductos"
            element={
              <AdminRoute>
                <PanelProductos />
              </AdminRoute>
            }
          />
          <Route
            path="/createProducts"
            element={
              <AdminRoute>
                <CreateProduct />
              </AdminRoute>
            }
          />
          <Route
            path="/panel/seller"
            element={
              <AdminRoute>
                <SellerForm />
              </AdminRoute>
            }
          />
          <Route
            path="/panel/ordenesPendientes"
            element={
              <AdminRoute>
                <OrdenesPendientes />
              </AdminRoute>
            }
          />
          <Route
            path="/panelGastos"
            element={
              <AdminRoute>
                <PanelInformes/>
              </AdminRoute>
            }
          />
          <Route
            path="/panelGastos/createGastos"
            element={
              <AdminRoute>
                <CargarGastos/>
              </AdminRoute>
            }
          />
          <Route
            path="/panelGastos/filtroGastos"
            element={
              <AdminRoute>
                <FilterExpenses/>
              </AdminRoute>
            }
          />
          <Route
            path="/informes"
            element={
              <AdminRoute>
                <Balance/>
              </AdminRoute>
            }
          />
          <Route
            path="/invoice"
            element={
              <AdminRoute>
                <Invoice />
              </AdminRoute>
            }
          />
          <Route
            path="/creditN"
            element={
              <AdminRoute>
                <CreditN />
              </AdminRoute>
            }
          />

         
         
          <Route
            exact
            path="/panel/createProducts"
            element={
              <AdminRoute>
                <CreateProduct />
              </AdminRoute>
            }
          />
        </Routes>
        </ErrorBoundary>
      </div>

      {/* Renderiza estos componentes solo si no estás en una ruta de admin */}
      {!isAdminRoute && (
        <>
          <Footer />
          <CartButton />
          <WhatsappButton />
        </>
      )}
      
      </>
  );
}
export default App;
