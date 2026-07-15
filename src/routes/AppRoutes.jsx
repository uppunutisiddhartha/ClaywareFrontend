import { Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import HomePage from "../pages/Homepage";
import ShopPage from "../pages/ShopPage";
import ProductDetails from "../pages/ProductDetails";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import OrderSuccess from "../pages/OrderSuccess";
import Orders from "../pages/Orders";
import UserRegister from "../pages/registerpages/userregister";
// import SellerRegister from "../pages/registerpages/sellerregister";
// import DeliveryAgentRegister from "../pages/registerpages/delivaryagentregister";

import PrivateRoute from "./PrivateRoute";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route path="/login" element={<Login />} />

      <Route
        path="/shop"
        element={
          <PrivateRoute>
            <ShopPage />
          </PrivateRoute>
        }
      />

      <Route path="/product/:id" element={<ProductDetails />} />

      <Route
        path="/cart"
        element={
          <PrivateRoute>
            <Cart />
          </PrivateRoute>
        }
      />

      <Route
        path="/checkout"
        element={
          <PrivateRoute>
            <Checkout />
          </PrivateRoute>
        }
      />

      <Route
        path="/order-success"
        element={
          <PrivateRoute>
            <OrderSuccess />
          </PrivateRoute>
        }
      />


      <Route path="/register" element={<UserRegister />} />
      {/* <Route path="/seller-register" element={<SellerRegister />} />
      <Route path="/delivery-register" element={<DeliveryAgentRegister />} /> */}
    </Routes>
  );
}

export default AppRoutes;
