import { Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import HomePage from "../pages/Homepage";
import ShopPage from "../pages/ShopPage";
import ProductDetails from "../pages/ProductDetails";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import OrderDetails from "../pages/OrderDetails";
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
        path="/order-success/:orderId"
        element={
          <PrivateRoute>
            <OrderSuccess />
          </PrivateRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <PrivateRoute>
            <Orders />
          </PrivateRoute>
        }
      />

      <Route path="/register" element={<UserRegister />} />
      
      <Route
        path="/orders/:orderId"
        element={
          <PrivateRoute>
            <OrderDetails />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
