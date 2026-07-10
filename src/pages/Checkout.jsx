import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { loadRazorpay } from "../utils/loadRazorpay";

import {
  FiMapPin,
  FiPlus,
  FiCreditCard,
  FiTruck,
  FiCheckCircle,
  FiLock,
} from "react-icons/fi";
import {
  SiVisa,
  SiMastercard,
  SiGooglepay,
  SiPaytm,
  SiPhonepe,
} from "react-icons/si";
import { FaMoneyBillWave } from "react-icons/fa";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./styles/Checkout.css";

const EMPTY_FORM = {
  full_name: "",
  phone_number: "",
  address_line: "",
  city: "",
  state: "",
  pincode: "",
  address_type: "Home",
  is_default: false,
};

function Checkout() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);

  const [addresses, setAddresses] = useState([]);

  const [selectedAddress, setSelectedAddress] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState("COD");

  const [loading, setLoading] = useState(true);

  const [placingOrder, setPlacingOrder] = useState(false);

  const [processingPayment, setProcessingPayment] = useState(false);

  const [showOverlay, setShowOverlay] = useState(false);

  const [loadingText, setLoadingText] = useState(
    "Preparing your ClayWare order...",
  );

  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState(EMPTY_FORM);

  // ===================================
  // FETCH CART
  // ===================================

  const fetchCart = async () => {
    try {
      const res = await axios.get("https://claywarebackend.onrender.com/api/user/viewcart/", {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      setCart(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // ===================================
  // FETCH ADDRESS
  // ===================================

  const fetchAddresses = async () => {
    try {
      const res = await axios.get(
        "https://claywarebackend.onrender.com/api/user/user-addresses/",
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      );

      const list = res.data.addresses || [];

      setAddresses(list);

      const defaultAddress = list.find((a) => a.is_default) || list[0];

      if (defaultAddress) {
        setSelectedAddress(defaultAddress.address_id);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const load = async () => {
      await Promise.all([fetchCart(), fetchAddresses()]);

      setLoading(false);
    };

    load();
  }, []);

  // ===================================
  // FORM INPUT
  // ===================================

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ===================================
  // SAVE ADDRESS
  // ===================================

  const saveAddress = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "https://claywarebackend.onrender.com/api/user/add-address/",
        formData,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      );

      setShowForm(false);

      setFormData(EMPTY_FORM);

      fetchAddresses();
    } catch (err) {
      alert(err.response?.data?.message || "Unable to save address.");
    }
  };

  // ===================================
  // PLACE ORDER
  // ===================================

  const placeOrder = async () => {
    if (placingOrder) return;

    if (!selectedAddress) {
      alert("Please select an address.");
      return;
    }

    // ===================================
    // RAZORPAY PAYMENT
    // ===================================

    const handleRazorpayPayment = async (orderId) => {
      try {
        setProcessingPayment(true);

        const loaded = await loadRazorpay();

        if (!loaded) {
          alert("Unable to load Razorpay.");
          return;
        }

        const res = await axios.post(
          "https://claywarebackend.onrender.com/api/payments/create-order/",
          {
            order_id: orderId,
          },
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          },
        );

        const data = res.data;
        console.log(data);
const options = {
  key: data.key,
  amount: data.amount,
  currency: data.currency,
  name: "ClayWare",
  description: "ClayWare Order",
  order_id: data.razorpay_order_id,

  handler: async function (response) {
    try {
      const verify = await axios.post(
        "https://claywarebackend.onrender.com/api/payments/verify/",
        {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      console.log("Payment Verified", verify.data);

      // Hide loader
      setShowOverlay(false);
      setPlacingOrder(false);
      setProcessingPayment(false);

      navigate("/order-success");

    } catch (err) {

      console.log(err);

      setShowOverlay(false);
      setPlacingOrder(false);
      setProcessingPayment(false);

      alert("Payment verification failed.");
    }
  },

  modal: {
    ondismiss: async function () {

      console.log("Payment Cancelled");

      setShowOverlay(false);
      setPlacingOrder(false);
      setProcessingPayment(false);

      try {

        await axios.post(
          "https://claywarebackend.onrender.com/api/payments/payment-failed/",
          {
            order_id: orderId,
          },
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          }
        );

      } catch (err) {
        console.log(err);
      }

      alert("Payment cancelled.");
    },
  },

  theme: {
    color: "#8B5E3C",
  },
};

const razorpay = new window.Razorpay(options);

razorpay.on("payment.failed", async function (response) {

  console.log(response.error);

  setShowOverlay(false);
  setPlacingOrder(false);
  setProcessingPayment(false);

  try {

    await axios.post(
      "https://claywarebackend.onrender.com/api/payments/payment-failed/",
      {
        order_id: orderId,
      },
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      }
    );

  } catch (err) {
    console.log(err);
  }

  alert("Payment Failed.");
});

razorpay.open();

        razorpay.open();
      } catch (err) {
        console.log(err);

        alert("Unable to initiate payment.");
      } finally {
        setProcessingPayment(false);
      }
    };

    setPlacingOrder(true);

    setShowOverlay(true);

    setLoadingText("Checking your address...");

    try {
      setTimeout(() => {
        setLoadingText("Packing handcrafted products...");
      }, 800);

      setTimeout(() => {
        setLoadingText("Creating your order...");
      }, 1700);

      setTimeout(() => {
        setLoadingText("Redirecting securely...");
      }, 2700);

      const res = await axios.post(
        "https://claywarebackend.onrender.com//api/order/checkout/",
        {
          address_id: selectedAddress,
          payment_method: paymentMethod,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      );

      setTimeout(async () => {
        if (paymentMethod === "COD") {
          navigate("/order-success");
        } else {
          await handleRazorpayPayment(res.data.order_id);
        }
      }, 3200);
    } catch (err) {
      console.log(err);

      setShowOverlay(false);

      setPlacingOrder(false);

      alert(err.response?.data?.message || "Unable to place order.");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />

        <div className="checkout-loading">
          <div className="loading-pot">🏺</div>

          <h2>Preparing Checkout...</h2>
        </div>

        <Footer />
      </>
    );
  }
  return (
    <>
      <Navbar />

      {/* ==========================================
            ORDER PLACING OVERLAY
      =========================================== */}

      {showOverlay && (
        <div className="checkout-overlay">
          <div className="overlay-card">
            <div className="clay-loader">🏺</div>

            <h2>{loadingText}</h2>

            <div className="overlay-progress">
              <span></span>
            </div>

            <p>
              Please don't refresh this page while we prepare your handcrafted
              order.
            </p>
          </div>
        </div>
      )}

      <div className="checkout-page">
        {/* ===================================================
                    LEFT SECTION
        ==================================================== */}

        <div className="checkout-left">
          <div className="section-header">
            <div>
              <h2>Shipping Address</h2>

              <p>Select where you'd like your ClayWare products delivered.</p>
            </div>

            <button
              className="add-address-btn"
              onClick={() => setShowForm(!showForm)}
            >
              <FiPlus />
              Add Address
            </button>
          </div>

          {/* ======================================
                  ADDRESS LIST
          ======================================= */}

          <div className="address-list">
            {addresses.length === 0 ? (
              <div className="empty-address">
                <FiMapPin size={45} />

                <h3>No Address Found</h3>

                <p>Add your first delivery address to continue.</p>
              </div>
            ) : (
              addresses.map((addr) => (
                <div
                  key={addr.address_id}
                  className={`address-card ${
                    selectedAddress === addr.address_id ? "selected" : ""
                  }`}
                  onClick={() => setSelectedAddress(addr.address_id)}
                >
                  <div className="radio-box">
                    <input
                      type="radio"
                      checked={selectedAddress === addr.address_id}
                      readOnly
                    />
                  </div>

                  <div className="address-info">
                    <div className="address-top">
                      <h3>{addr.full_name}</h3>

                      {addr.is_default && (
                        <span className="default-badge">
                          <FiCheckCircle />
                          Default
                        </span>
                      )}
                    </div>

                    <span className="address-type">
                      {addr.address_type || "Home"}
                    </span>

                    <p>{addr.phone_number}</p>

                    <p>{addr.address_line}</p>

                    <p>
                      {addr.city}, {addr.state}
                    </p>

                    <p>{addr.pincode}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ======================================
                    ADDRESS FORM
          ======================================= */}

          {showForm && (
            <form className="address-form" onSubmit={saveAddress}>
              <h3>Add New Address</h3>

              <div className="form-grid">
                <input
                  name="full_name"
                  placeholder="Full Name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                />

                <input
                  name="phone_number"
                  placeholder="Phone Number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  required
                />
              </div>

              <textarea
                name="address_line"
                placeholder="House No, Street, Area..."
                value={formData.address_line}
                onChange={handleChange}
                required
              />

              <div className="form-grid">
                <input
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />

                <input
                  name="state"
                  placeholder="State"
                  value={formData.state}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-grid">
                <input
                  name="pincode"
                  placeholder="Pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  required
                />

                <select
                  name="address_type"
                  value={formData.address_type}
                  onChange={handleChange}
                >
                  <option value="Home">🏠 Home</option>

                  <option value="Office">🏢 Office</option>

                  <option value="Other">📍 Other</option>
                </select>
              </div>

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  name="is_default"
                  checked={formData.is_default}
                  onChange={handleChange}
                />
                Make this my default address
              </label>

              <div className="form-buttons">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="save-btn">
                  Save Address
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ===================================================
                RIGHT SIDE STARTS HERE
        ==================================================== */}

        <div className="checkout-right">
          {/* ===================================================
        ORDER SUMMARY
=================================================== */}

          <div className="summary-card">
            <div className="summary-title">
              <h2>Order Summary</h2>

              <span>{cart?.total_items} Items</span>
            </div>

            {/* ===========================================
          PRODUCTS
  =========================================== */}

            <div className="summary-products">
              {cart?.cart_items?.map((item) => (
                <div className="summary-product" key={item.cart_item_id}>
                  <img
                    src={item.product_image}
                    alt={item.product_name}
                    className="summary-image"
                  />

                  <div className="summary-details">
                    <h4>{item.product_name}</h4>

                    {/* Variant */}

                    <p className="summary-variant">
                      {item.variant_capacity
                        ? item.variant_capacity
                        : "Standard"}
                    </p>

                    <p>
                      Qty :<strong> {item.quantity}</strong>
                    </p>
                  </div>

                  <div className="summary-price">
                    ₹{item.subtotal_discount_price}
                  </div>
                </div>
              ))}
            </div>

            {/* ===========================================
          PRICE DETAILS
  =========================================== */}

            <div className="price-details">
              <h3>Price Details</h3>

              <div className="summary-row">
                <span>Subtotal</span>

                <span>₹{cart.total_original_price}</span>
              </div>

              <div className="summary-row">
                <span>Discount</span>

                <span className="price-green">- ₹{cart.total_savings}</span>
              </div>

              <div className="summary-row">
                <span>Delivery</span>

                <span className="price-green">FREE</span>
              </div>

              <hr />

              <div className="summary-total">
                <span>Total</span>

                <span>₹{cart.total_discount_price}</span>
              </div>
            </div>

            {/* ===========================================
          PAYMENT
  =========================================== */}

            <div className="payment-section">
              <h3>
                <FiLock />
                Secure Payment
              </h3>

              {/* COD */}

              <div
                className={`payment-card ${
                  paymentMethod === "COD" ? "active" : ""
                }`}
                onClick={() => setPaymentMethod("COD")}
              >
                <input
                  type="radio"
                  checked={paymentMethod === "COD"}
                  readOnly
                />

                <FaMoneyBillWave className="payment-icon" />

                <div>
                  <h4>Cash on Delivery</h4>

                  <p>Pay after your order arrives.</p>
                </div>
              </div>

              {/* UPI */}

              <div
                className={`payment-card ${
                  paymentMethod === "RAZORPAY" ? "active" : ""
                }`}
                onClick={() => setPaymentMethod("RAZORPAY")}
              >
                <input
                  type="radio"
                  checked={paymentMethod === "RAZORPAY"}
                  readOnly
                />

                <FiCreditCard className="payment-icon" />

                <div>
                  <h4>UPI Payment</h4>

                  <p>Google Pay • PhonePe • Paytm</p>
                </div>
              </div>

              {/* CARD */}

              <div
                className={`payment-card ${
                  paymentMethod === "RAZORPAY" ? "active" : ""
                }`}
                onClick={() => setPaymentMethod("RAZORPAY")}
              >
                <input
                  type="radio"
                  checked={paymentMethod === "CARD"}
                  readOnly
                />

                <FiCreditCard className="payment-icon" />

                <div>
                  <h4>Credit / Debit Card</h4>

                  <p>Visa • Mastercard • RuPay</p>
                </div>
              </div>

              {/* NET BANKING */}

              <div
                className={`payment-card ${
                  paymentMethod === "RAZORPAY" ? "active" : ""
                }`}
                onClick={() => setPaymentMethod("RAZORPAY")}
              >
                <input
                  type="radio"
                  checked={paymentMethod === "RAZORPAY"}
                  readOnly
                />

                <FiTruck className="payment-icon" />

                <div>
                  <h4>Net Banking</h4>

                  <p>All major Indian banks</p>
                </div>
              </div>
            </div>

            {/* ===========================================
          PAYMENT LOGOS
  =========================================== */}

            <div className="payment-logos">
              <h4>Accepted Payments</h4>

              <div className="logo-grid">
                <div className="logo-box">
                  <SiVisa />

                  <span>Visa</span>
                </div>

                <div className="logo-box">
                  <SiMastercard />

                  <span>Master</span>
                </div>

                <div className="logo-box">
                  <img src="/images/rupay.png" alt="RuPay" />
                </div>

                <div className="logo-box">
                  <img src="/images/upi.png" alt="UPI" />
                </div>

                <div className="logo-box">
                  <SiGooglepay />
                </div>

                <div className="logo-box">
                  <SiPhonepe />
                </div>

                <div className="logo-box">
                  <SiPaytm />
                </div>
              </div>
            </div>

            {/* ===========================================
          SECURITY
  =========================================== */}

            <div className="secure-checkout">
              <FiLock />

              <span>100% Secure SSL Encrypted Checkout</span>
            </div>

            {/* ===========================================
          BUTTON
  =========================================== */}

            <button
              className="place-order-btn"
              disabled={placingOrder}
              onClick={placeOrder}
            >
              {placingOrder ? "Preparing Order..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Checkout;
