
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import CreateProduct from "./Components/Product/CreateProduct"
import ProductsList from "./Components/Product/ProducstList";
import ProductDetails from "./Components/Product/ProductDetails";
import Cart from "./Components/Cart";
import Checkout from "./Components/Checkout";
import Navbar from "./Components/Navbar";
import Register from "./Components/Users/Register";
import Login from "./Components/Users/Login";
import OrdersDetails from "./Components/OrdersDetail";
import OrdersList from "./Components/OrdersList";
import UpdateProduct from "./Components/Product/UpdateProduct";
import CreateCategory from "./Components/Product/CreateCategory";
import CreateSB from "./Components/Product/CreateSB";
import Footer from "./Components/Footer";
import CartButton from "./Components/CartButton";
import Landing from "./Components/Landing";
import CardsAnimated from "./Components/CardsAnimated";
import ThankYouPage from "./Components/ThankYouPage";
import FilteredProducts from "./Components/Product/FilteredProducts";
import PrivateRoute from './Components/PrivateRoute';
import LandingPrincipal from "./Components/LandingPrincipal";
import WhatsappButton from "./Components/WhatsappButton";
import Facturacion from "./Components/Taxxa/Facturacion";
import LoginTaxxa from "./Components/Taxxa/loginTaxxa";

  function App() {
    return (
      <Router>
    
        <div>
         <Navbar/>
         
          <Routes>
          <Route path="/" element={<LandingPrincipal />} />
            <Route exact path="/register" element={<Register/>}/>
            <Route exact path="/login" element={<Login/>}/>
            <Route exact path="/products" element={<ProductsList />} />
            <Route exact path="/caballeros" element={<Landing />} />
            <Route exact path="/caballerosList" element={<ProductsList />} />
            <Route exact path="/cardsanimated" element={<CardsAnimated />} />
            <Route exact path="/product/:id" element={<ProductDetails />} />
            <Route exact path="/myOrders/:n_document" element={ <PrivateRoute>
              <OrdersDetails />
            </PrivateRoute>} />
            <Route exact path="/allOrders" element={ <PrivateRoute>
              <OrdersList/>
            </PrivateRoute>}/>
            <Route exact path="/createProducts" element={<PrivateRoute>
              <CreateProduct />
            </PrivateRoute>} />
            <Route exact path="/cart" element={<Cart />} />
            <Route exact path="/checkout" element={<Checkout />} />  
            <Route exact path="/gracias" element={<ThankYouPage />} /> 
            <Route path="/updateProduct/:id" element={<PrivateRoute>
              <UpdateProduct />
            </PrivateRoute>} /> 
            <Route path="/panel/facturacion" element={<PrivateRoute>
              <Facturacion />
            </PrivateRoute>} /> 
            <Route path="/loginTaxxa" element={<PrivateRoute>
              <LoginTaxxa />
            </PrivateRoute>} /> 
            <Route path="/category" element={<CreateCategory/>}/>  
            <Route path="/sb" element={<CreateSB/>}/>  
            <Route path="/productsCat/:categoryName" element={<FilteredProducts />} />     
          </Routes>
        </div>
        <Footer/>
        <CartButton /> 
        <WhatsappButton/>
      </Router>
    );
  }
export default App