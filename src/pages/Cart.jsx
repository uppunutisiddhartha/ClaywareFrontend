import { useEffect, useState } from "react";
import axios from "axios";
import { FiShoppingBag } from "react-icons/fi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import "./styles/Cart.css";

function Cart() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");


  // =========================
  // Fetch Cart
  // =========================
  const fetchCart = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/user/viewcart/",
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      );

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
      await axios.post(
        `http://127.0.0.1:8000/api/user/addtocart/${productId}/`,
        {},
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      );

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
      await axios.delete(
        `http://127.0.0.1:8000/api/user/remove-cart-item/${cartItemId}/`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      );

      fetchCart();


      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.log(error);
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

if (loading) {
    return (
      <>
        <Navbar />

        <div className="cart-loading">
          <h2>Loading your cart...</h2>
        </div>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="cart-page">
        <h1 className="cart-heading">
          <FiShoppingBag />
          Shopping Cart
        </h1>

        {!cart || cart.total_items === 0 ? (
          <div className="empty-cart">
            <img
              src="https://cdn-icons-png.flaticon.com/512/2038/2038854.png"
              alt="Empty Cart"
            />

            <h2>Your Cart is Empty</h2>

            <p>Start shopping to add amazing clay products.</p>
          </div>
        ) : (
          <div className="cart-layout">
            {/* LEFT SIDE */}

            <div className="cart-products">
              {cart.cart_items.map((item) => {
                const discount = Math.round(
                  ((Number(item.original_price) - Number(item.discount_price)) /
                    Number(item.original_price)) *
                    100,
                );

                return (
                  <div className="cart-card" key={item.cart_item_id}>
                    {/* IMAGE */}

                    <div className="cart-image-box">
                      <img
                        src={
                          item.product_image ||
                          "https://via.placeholder.com/250"
                        }
                        alt={item.product_name}
                        className="cart-image"
                      />
                    </div>

                    {/* PRODUCT DETAILS */}

                    <div className="cart-details">
                      <h2>{item.product_name}</h2>

                      {/* STOCK STATUS */}

                      <p
                        className={`stock ${
                          item.stock_quantity === 0
                            ? "out-stock"
                            : item.stock_quantity <= 5
                              ? "low-stock"
                              : "available-stock"
                        }`}
                      >
                        {item.stock_quantity === 0 ? (
                          <>
                            <span className="stock-icon">❌</span>
                            Out of Stock
                          </>
                        ) : item.stock_quantity <= 5 ? (
                          <>
                            <span className="stock-icon">🔥</span>
                            Only <strong>{item.stock_quantity}</strong> left in
                            stock
                          </>
                        ) : (
                          <>
                            <span className="stock-icon">✅</span>
                            In Stock
                          </>
                        )}
                      </p>

                      <div className="price-row">
                        <span className="price">₹{item.discount_price}</span>

                        <span className="old-price">
                          ₹{item.original_price}
                        </span>

                        <span className="discount-badge">{discount}% OFF</span>
                      </div>

                      <p className="save-text">You save ₹{item.you_save}</p>

                      {/* Quantity */}

                      <div className="quantity-box">
                        <button
                          className="qty-btn"
                          onClick={() => decreaseQuantity(item.cart_item_id)}
                        >
                          −
                        </button>

                        <span className="qty-value">{item.quantity}</span>

                        <button
                          className="qty-btn"
                          onClick={() => increaseQuantity(item.product_id)}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* RIGHT */}

                    <div className="cart-actions">
                      <div className="subtotal-title">Total</div>

                      <div className="subtotal">
                        ₹{item.subtotal_discount_price}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* ================= RIGHT SIDE ================= */}

            <div className="cart-summary">
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
                <span>Delivery Charges</span>

                <span className="green">FREE</span>
              </div>

              <div className="free-delivery">🚚 Free Delivery Unlocked</div>

              <hr />

              <div className="summary-total">
                <span>Total Payable</span>

                <span>₹{cart.total_discount_price}</span>
              </div>

              <div className="saving-box">
                🎉 Congratulations!
                <br />
                <br />
                You saved
                <h2>₹{cart.total_savings}</h2>
                on this order.
              </div>

              <button
  className="checkout-btn"
  onClick={handleCheckout}
>
  Proceed to Checkout
</button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}

export default Cart;
