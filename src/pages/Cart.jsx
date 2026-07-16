import { useEffect, useState } from "react";
import { FiShoppingBag, FiTrash2, FiHeart, FiTruck, FiShield, FiLock } from "react-icons/fi";
import { FaRegHeart } from "react-icons/fa";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import "./styles/Cart.css";
import api from "../api/axios";

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  const token = localStorage.getItem("token");

  // =========================
  // Fetch Cart
  // =========================
  const fetchCart = async () => {
    try {
      const response = await api.get("/user/viewcart/");
      console.log("Cart API:", response.data);
      setCart(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // =========================
  // Increase Quantity
  // =========================
  const increaseQuantity = async (productId) => {
    try {
      await api.post(`/user/addtocart/${productId}/`);
      fetchCart();
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.log(error);
    }
  };

  // =========================
  // Decrease Quantity
  // =========================
  const decreaseQuantity = async (cartItemId) => {
    try {
      await api.post(`api/user/remove-cart-item/${cartItemId}/`);
      fetchCart();
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.log(error);
    }
  };

  // =========================
  // Remove Item
  // =========================
  const removeItem = async (cartItemId) => {
    try {
      await api.delete(`/user/remove-cart-item/${cartItemId}/`);
      fetchCart();
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.log(error);
    }
  };

  // =========================
  // Apply Coupon
  // =========================
  const applyCoupon = () => {
    if (couponCode.toUpperCase() === "SAVE20") {
      setCouponApplied(true);
    } else if (couponCode.toUpperCase() === "WELCOME10") {
      setCouponApplied(true);
    } else {
      alert("Invalid coupon code");
    }
  };

  // =========================
  // Proceed to Checkout
  // =========================
  const handleCheckout = () => {
    if (!cart || cart.total_items === 0) {
      alert("Your cart is empty.");
      return;
    }
    navigate("/checkout");
  };

  // =========================
  // Get Stock Status
  // =========================
  const getStockStatus = (stock) => {
    if (stock === 0) {
      return { type: 'out-of-stock', label: 'Out of Stock', color: '#999' };
    } else if (stock > 10) {
      return { type: 'in-stock', label: '✅ In Stock', color: '#2E7D32' };
    } else if (stock >= 5 && stock <= 10) {
      return { type: 'limited', label: `⚠️ Only ${stock} left`, color: '#F57C00' };
    } else if (stock >= 1 && stock <= 4) {
      return { type: 'very-low', label: `🔥 Only ${stock} left`, color: '#D32F2F' };
    }
    return null;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="cart-loading">
          <div className="loader-spinner"></div>
          <p>Loading your cart...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="cart-page">
        <div className="cart-header">
          <h1 className="cart-heading">
            <FiShoppingBag />
            Shopping Cart
            {cart && cart.total_items > 0 && (
              <span className="cart-badge">{cart.total_items} items</span>
            )}
          </h1>
        </div>

        {!cart || cart.total_items === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon">
              <FiShoppingBag />
            </div>
            <h2>Your cart is empty</h2>
            <p>Start shopping to add amazing clay products.</p>
            <button onClick={() => navigate("/shop")} className="shop-btn">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="cart-layout">
            {/* LEFT SIDE - Cart Items */}
            <div className="cart-items">
              {cart.cart_items.map((item) => {
                const discount = Math.round(
                  ((Number(item.original_price) - Number(item.discount_price)) /
                    Number(item.original_price)) * 100
                );
                const stockStatus = getStockStatus(item.stock_quantity);
                const isOutOfStock = item.stock_quantity === 0;

                return (
                  <div className="cart-item" key={item.cart_item_id}>
                    {/* Product Image */}
                    <div className="item-image">
                      <img
                        src={item.product_image || "https://via.placeholder.com/250"}
                        alt={item.product_name}
                      />
                      {discount > 0 && (
                        <span className="item-discount">{discount}% OFF</span>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="item-details">
                      <h3>{item.product_name}</h3>
                      
                      <div className="item-meta">
                        <span>{item.category || "Clayware"}</span>
                        <span>{item.variant || "Standard"}</span>
                      </div>

                      {/* Stock Status */}
                      <div className={`item-stock ${stockStatus?.type}`}>
                        <span className="stock-dot"></span>
                        <span style={{ color: stockStatus?.color }}>
                          {stockStatus?.label}
                        </span>
                      </div>

                      {/* Price */}
                      <div className="item-price">
                        <span className="current-price">₹{item.discount_price}</span>
                        {item.original_price > item.discount_price && (
                          <>
                            <span className="original-price">₹{item.original_price}</span>
                            <span className="save-badge">Save ₹{item.you_save}</span>
                          </>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="item-quantity">
                        <button
                          className="qty-btn"
                          onClick={() => decreaseQuantity(item.cart_item_id)}
                          disabled={item.quantity <= 1 || isOutOfStock}
                        >
                          −
                        </button>
                        <span className="qty-value">{item.quantity}</span>
                        <button
                          className="qty-btn"
                          onClick={() => increaseQuantity(item.product_id)}
                          disabled={isOutOfStock}
                        >
                          +
                        </button>
                        <span className="qty-stock">
                          {item.stock_quantity > 0 && `${item.stock_quantity} available`}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="item-actions">
                        <button 
                          className="action-remove"
                          onClick={() => removeItem(item.cart_item_id)}
                        >
                          <FiTrash2 /> Remove
                        </button>
                        <button className="action-wishlist">
                          <FaRegHeart /> Wishlist
                        </button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="item-total">
                      <span className="total-label">Total</span>
                      <span className="total-price">₹{item.subtotal_discount_price}</span>
                    </div>
                  </div>
                );
              })}

              {/* Trust Badges */}
              <div className="trust-section">
                <div className="trust-item">
                  <FiShield /> ClayWare Assured
                </div>
                <div className="trust-item">
                  <FiLock /> Secure Payments
                </div>
                <div className="trust-item">
                  <FiTruck /> Free Delivery
                </div>
              </div>
            </div>

            {/* RIGHT SIDE - Order Summary */}
            <div className="order-summary">
              <h2>Order Summary</h2>

              <div className="summary-row">
                <span>Items ({cart.total_items})</span>
                <span>₹{cart.total_original_price}</span>
              </div>

              <div className="summary-row">
                <span>Total Discount</span>
                <span className="green">- ₹{cart.total_savings}</span>
              </div>

              <div className="summary-row">
                <span>Delivery</span>
                <span className="green">FREE</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-total">
                <span>Total</span>
                <span>₹{cart.total_discount_price}</span>
              </div>

              {/* Coupon */}
              <div className="coupon-section">
                <div className="coupon-input-group">
                  <input
                    type="text"
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={couponApplied}
                  />
                  <button 
                    onClick={applyCoupon}
                    disabled={couponApplied || !couponCode}
                  >
                    {couponApplied ? 'Applied ✓' : 'Apply'}
                  </button>
                </div>
                {couponApplied && (
                  <div className="coupon-success">✓ Coupon applied!</div>
                )}
              </div>

              {/* Savings */}
              <div className="savings-box">
                <span>🎉 You saved</span>
                <strong>₹{cart.total_savings}</strong>
                <span>on this order</span>
              </div>

              {/* Checkout Button */}
              <button className="checkout-btn" onClick={handleCheckout}>
                Proceed to Checkout
              </button>

              <p className="secure-text">🔒 Secure Checkout</p>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}

export default Cart;