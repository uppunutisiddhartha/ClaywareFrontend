import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import api from "../api/axios";
import { loadRazorpay } from "../utils/loadRazorpay";

import {
  FiPlus,
  FiCreditCard,
  FiTruck,
  FiLock,
  FiUser,
  FiPhone,
  FiEdit2,
  FiTrash2,
  FiCheck,
  FiGift,
  FiTag,
  FiPackage,
  FiShield,
  FiClock,
  FiSearch,
  FiX,
  FiChevronDown,
  FiArrowLeft,
  FiMapPin,
  FiHome,
  FiBriefcase,
  FiSmartphone,
  FiDollarSign,
  FiHeart,
  FiShoppingBag,
  FiInfo,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";

import {
  SiVisa,
  SiMastercard,
  SiGooglepay,
  SiPaytm,
  SiPhonepe,
} from "react-icons/si";

import { FaMoneyBillWave, FaQrcode, FaRocket, FaShieldAlt } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { HiOutlineLocationMarker, HiOutlineCheckCircle } from "react-icons/hi";

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
  const navigate = useNavigate();
  const location = useLocation();

  const buyNowData = location.state;

  const [cart, setCart] = useState({
    cart_items: [],
    total_items: 0,
    total_original_price: 0,
    total_discount_price: 0,
    total_savings: 0,
  });

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [loadingText, setLoadingText] = useState("Preparing your order...");
  const [loadingStep, setLoadingStep] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showAddressDrawer, setShowAddressDrawer] = useState(false);
  const [searchAddress, setSearchAddress] = useState("");
  const [showQRCode, setShowQRCode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isAddressDrawerVisible, setIsAddressDrawerVisible] = useState(false);
  const [expandedPaymentInfo, setExpandedPaymentInfo] = useState(false);

  // =====================================
  // CHECK DEVICE
  // =====================================

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  // =====================================
  // FETCH CART
  // =====================================

  const fetchCart = async () => {
    try {
      const res = await api.get("/user/viewcart/");
      setCart(res.data);
    } catch (err) {
      console.error("Cart Error:", err);
    }
  };

  // =====================================
  // FETCH ADDRESSES
  // =====================================

  const fetchAddresses = async () => {
    try {
      const res = await api.get("/user/user-addresses/");
      const list = res.data.addresses || [];
      setAddresses(list);
      const defaultAddress = list.find((item) => item.is_default) || list[0];
      if (defaultAddress) {
        setSelectedAddress(defaultAddress.address_id);
      }
    } catch (err) {
      console.error("Address Error:", err);
    }
  };

  // =====================================
  // INITIAL LOAD
  // =====================================

  useEffect(() => {
    const loadData = async () => {
      try {
        if (buyNowData?.buyNow) {
          setCart({
            cart_items: [
              {
                cart_item_id: "buy-now",
                product_name: buyNowData.product_name,
                product_image: buyNowData.product_image,
                quantity: buyNowData.quantity,
                variant_capacity: buyNowData.variant_capacity || "Standard",
                subtotal_discount_price: buyNowData.price * buyNowData.quantity,
              },
            ],
            total_items: buyNowData.quantity,
            total_original_price: buyNowData.price * buyNowData.quantity,
            total_discount_price: buyNowData.price * buyNowData.quantity,
            total_savings: 0,
          });
          await fetchAddresses();
        } else {
          await Promise.all([fetchCart(), fetchAddresses()]);
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // =====================================
  // HANDLE FORM INPUT
  // =====================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // =====================================
  // ADD/EDIT ADDRESS
  // =====================================

  const saveAddress = async () => {
    try {
      const url = editingAddress 
        ? `/user/update-address/${editingAddress}/`
        : "/user/add-address/";
      const method = editingAddress ? "put" : "post";
      
      const res = await api[method](url, formData);
      alert(editingAddress ? "Address updated successfully" : "Address added successfully");
      
      setShowForm(false);
      setEditingAddress(null);
      setFormData(EMPTY_FORM);
      await fetchAddresses();
      
      if (res.data.address_id) {
        setSelectedAddress(res.data.address_id);
      }
      
      // Close drawer after saving
      setShowAddressDrawer(false);
    } catch (err) {
      console.error("Save Address Error:", err);
      alert("Unable to save address");
    }
  };

  // =====================================
  // DELETE ADDRESS
  // =====================================

  const deleteAddress = async (addressId) => {
    try {
      await api.delete(`/user/delete-address/${addressId}/`);
      await fetchAddresses();
      setShowDeleteConfirm(null);
      if (selectedAddress === addressId) {
        setSelectedAddress(null);
      }
    } catch (err) {
      console.error("Delete Address Error:", err);
      alert("Unable to delete address");
    }
  };

  // =====================================
  // EDIT ADDRESS
  // =====================================

  const editAddress = (address) => {
    setFormData({
      full_name: address.full_name,
      phone_number: address.phone_number,
      address_line: address.address_line,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      address_type: address.address_type || "Home",
      is_default: address.is_default || false,
    });
    setEditingAddress(address.address_id);
    setShowForm(true);
  };

  // =====================================
  // OPEN ADD ADDRESS FORM INSIDE DRAWER
  // =====================================

  const openAddAddressForm = () => {
    setEditingAddress(null);
    setFormData(EMPTY_FORM);
    setShowForm(true);
  };

  // =====================================
  // CLOSE ADDRESS FORM
  // =====================================

  const closeAddressForm = () => {
    setShowForm(false);
    setEditingAddress(null);
    setFormData(EMPTY_FORM);
  };

  // =====================================
  // CREATE ORDER
  // =====================================

  const placeOrder = async () => {
    if (!selectedAddress) {
      alert("Please select delivery address");
      return;
    }

    setPlacingOrder(true);
    setShowOverlay(true);
    setLoadingStep(0);

    try {
      setLoadingText("Preparing your order...");
      setLoadingStep(1);
      await new Promise(resolve => setTimeout(resolve, 800));

      setLoadingText("Creating your order...");
      setLoadingStep(2);
      
      const payload = {
        address_id: selectedAddress,
        payment_method: paymentMethod,
        buy_now: buyNowData?.buyNow || false,
        buy_now_product: buyNowData?.buyNow
          ? {
              product_id: buyNowData.product_id,
              quantity: buyNowData.quantity,
              variant_id: buyNowData.variant_id,
            }
          : null,
      };

      const res = await api.post("/order/checkout/", payload);
      const order = res.data;

      if (paymentMethod === "COD") {
        setLoadingText("Order placed successfully!");
        setLoadingStep(4);
        setTimeout(() => {
          navigate(`/order-success/${order.order_id}`);
        }, 1500);
      } else {
        await handleRazorpayPayment(order.order_id);
      }
    } catch (err) {
      console.error("Order Error:", err);
      alert("Unable to place order");
      setShowOverlay(false);
    } finally {
      setPlacingOrder(false);
    }
  };

  // =====================================
  // RAZORPAY PAYMENT
  // =====================================

  const handleRazorpayPayment = async (orderId) => {
    try {
      setProcessingPayment(true);
      setLoadingText("Opening secure payment gateway...");
      setLoadingStep(3);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const razorpayRes = await api.post("/payments/create-order/", {
        order_id: orderId,
      });
      const data = razorpayRes.data;
      const loaded = await loadRazorpay();
      if (!loaded) {
        alert("Razorpay failed to load");
        return;
      }

      const selectedAddr = addresses.find(a => a.address_id === selectedAddress);
      
      const options = {
        key: data.key,
        amount: data.amount,
        currency: "INR",
        name: "ClayWare",
        description: "ClayWare Order Payment",
        order_id: data.razorpay_order_id,
        handler: async function (response) {
          try {
            setLoadingText("Verifying payment...");
            setLoadingStep(4);
            const verifyRes = await api.post("/payments/verify/", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: orderId,
            });
            if (verifyRes.data.success) {
              setLoadingText("Payment successful!");
              setLoadingStep(5);
              setTimeout(() => {
                navigate(`/order-success/${orderId}`);
              }, 1500);
            }
          } catch (error) {
            console.error("Payment Verification Error:", error);
            alert("Payment verification failed");
            setShowOverlay(false);
          }
        },
        prefill: {
          name: selectedAddr?.full_name || "",
          contact: selectedAddr?.phone_number || "",
        },
        theme: {
          color: "#C86A2B",
        },
        modal: {
          ondismiss: function() {
            setShowOverlay(false);
            setProcessingPayment(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      razorpay.on("payment.failed", function (response) {
        console.log(response.error);
        alert("Payment failed. Please try again.");
        setShowOverlay(false);
        setProcessingPayment(false);
      });
    } catch (error) {
      console.error("Razorpay Error:", error);
      alert("Unable to start payment");
      setShowOverlay(false);
    } finally {
      setProcessingPayment(false);
    }
  };

  // =====================================
  // TOTAL PRICE
  // =====================================

  const finalAmount = cart.total_discount_price;

  // =====================================
  // FILTERED ADDRESSES
  // =====================================

  const filteredAddresses = addresses.filter(addr =>
    addr.full_name.toLowerCase().includes(searchAddress.toLowerCase()) ||
    addr.address_line.toLowerCase().includes(searchAddress.toLowerCase()) ||
    addr.city.toLowerCase().includes(searchAddress.toLowerCase())
  );

  // =====================================
  // GET ADDRESS ICON
  // =====================================

  const getAddressIcon = (type) => {
    switch(type?.toLowerCase()) {
      case 'home': return <FiHome />;
      case 'work': return <FiBriefcase />;
      default: return <FiMapPin />;
    }
  };

  // =====================================
  // LOADING SCREEN
  // =====================================

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="checkout-loader">
          <div className="loader-container">
            <div className="clay-loader">
              <div className="clay-ring"></div>
              <div className="clay-ring-2"></div>
              <div className="clay-logo">✦</div>
            </div>
            <h2 className="loader-title">Preparing your checkout</h2>
            <p className="loader-subtitle">Please wait while we get everything ready</p>
            <div className="loader-shimmer">
              <div className="shimmer-line"></div>
              <div className="shimmer-line"></div>
              <div className="shimmer-line"></div>
              <div className="shimmer-line"></div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="checkout-page">
        <div className="checkout-container">
          {/* =========================
              LEFT SECTION
          ========================== */}
          <div className="checkout-left">
            {/* SHIPPING ADDRESS */}
            <div className="checkout-card address-card">
              <div className="card-header">
                <div className="header-left">
                  <div className="header-icon-wrapper">
                    <HiOutlineLocationMarker className="header-icon" />
                  </div>
                  <div>
                    <h2 className="section-title">Delivery Address</h2>
                    <p className="section-subtitle">Where should we ship your order?</p>
                  </div>
                </div>
                {selectedAddress && (
                  <button 
                    className="change-address-btn"
                    onClick={() => setShowAddressDrawer(true)}
                  >
                    Change
                  </button>
                )}
              </div>

              {/* Selected Address */}
              {selectedAddress && addresses.filter(a => a.address_id === selectedAddress).length > 0 ? (
                addresses.filter(a => a.address_id === selectedAddress).map(address => (
                  <div key={address.address_id} className="selected-address premium">
                    <div className="address-card-content">
                      <div className="address-badge-row">
                        <div className="address-name-group">
                          <span className="address-name">{address.full_name}</span>
                          <span className="address-phone">{address.phone_number}</span>
                        </div>
                        <div className="address-tags">
                          {address.is_default && (
                            <span className="tag-default">
                              <HiOutlineCheckCircle className="tag-icon" />
                              Default
                            </span>
                          )}
                          <span className={`tag-type ${address.address_type.toLowerCase()}`}>
                            {getAddressIcon(address.address_type)}
                            {address.address_type}
                          </span>
                        </div>
                      </div>
                      <p className="address-line">
                        {address.address_line}, {address.city}, {address.state} - {address.pincode}
                      </p>
                    </div>
                    <div className="address-actions">
                      <button 
                        className="action-btn edit"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          editAddress(address);
                          setShowAddressDrawer(true);
                        }}
                        aria-label="Edit address"
                      >
                        <FiEdit2 />
                      </button>
                      <button 
                        className="action-btn delete"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setShowDeleteConfirm(address.address_id);
                        }}
                        aria-label="Delete address"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                    <div className="address-check-badge">
                      <FiCheck />
                    </div>
                  </div>
                ))
              ) : (
                /* ==========================================
                   EMPTY STATE - NO ADDRESS
                   ========================================== */
                <div className="empty-address-state">
                  <div className="empty-icon-wrapper">
                    <HiOutlineLocationMarker className="empty-icon" />
                  </div>
                  <h3 className="empty-title">No Delivery Address</h3>
                  <p className="empty-description">
                    Please add your delivery address before placing your order.
                  </p>
                  <button 
                    className="add-address-primary"
                    onClick={() => {
                      setShowAddressDrawer(true);
                      setTimeout(() => openAddAddressForm(), 100);
                    }}
                  >
                    <FiPlus className="btn-icon" /> Add Address
                  </button>
                </div>
              )}
            </div>

            {/* PAYMENT METHOD */}
            <div className="checkout-card payment-card">
              <div className="card-header">
                <div className="header-left">
                  <div className="header-icon-wrapper">
                    <FiCreditCard className="header-icon" />
                  </div>
                  <div>
                    <h2 className="section-title">Payment Method</h2>
                    <p className="section-subtitle">Choose how you'd like to pay</p>
                  </div>
                </div>
              </div>

              <div className="payment-methods-grid">
                {/* COD Option */}
                <label className={`payment-method ${paymentMethod === "COD" ? "active" : ""}`}>
                  <input
                    type="radio"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-method-content">
                    <div className="payment-method-icon">
                      <FaMoneyBillWave />
                    </div>
                    <div className="payment-method-info">
                      <h4>Cash on Delivery</h4>
                      <p>Pay when you receive</p>
                    </div>
                    {paymentMethod === "COD" && (
                      <div className="payment-method-check">
                        <FiCheck />
                      </div>
                    )}
                  </div>
                </label>

                {/* Razorpay Option */}
                <label className={`payment-method ${paymentMethod === "RAZORPAY" ? "active" : ""}`}>
                  <input
                    type="radio"
                    value="RAZORPAY"
                    checked={paymentMethod === "RAZORPAY"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-method-content">
                    <div className="payment-method-icon">
                      <FaShieldAlt />
                    </div>
                    <div className="payment-method-info">
                      <h4>Pay with Razorpay</h4>
                      <p>UPI • Cards • Net Banking • Wallets</p>
                    </div>
                    {paymentMethod === "RAZORPAY" && (
                      <div className="payment-method-check">
                        <FiCheck />
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {/* Razorpay Details */}
              {paymentMethod === "RAZORPAY" && (
                <div className="razorpay-details">
                  <div className="razorpay-header" onClick={() => setExpandedPaymentInfo(!expandedPaymentInfo)}>
                    <div className="razorpay-header-left">
                      <FaShieldAlt className="razorpay-shield" />
                      <span>Secure Payments Powered by Razorpay</span>
                    </div>
                    <FiChevronDown className={`razorpay-chevron ${expandedPaymentInfo ? 'expanded' : ''}`} />
                  </div>
                  {expandedPaymentInfo && (
                    <div className="razorpay-expanded">
                      <p className="razorpay-description">
                        Razorpay provides a secure, seamless checkout experience. 
                        You can pay using:
                      </p>
                      <div className="razorpay-methods">
                        <div className="razorpay-method-item">
                          <span className="method-dot">•</span>
                          <span>UPI (Google Pay, PhonePe, Paytm, BHIM)</span>
                        </div>
                        <div className="razorpay-method-item">
                          <span className="method-dot">•</span>
                          <span>Credit & Debit Cards (Visa, Mastercard, RuPay)</span>
                        </div>
                        <div className="razorpay-method-item">
                          <span className="method-dot">•</span>
                          <span>Net Banking (All major banks)</span>
                        </div>
                        <div className="razorpay-method-item">
                          <span className="method-dot">•</span>
                          <span>Wallets (Paytm, Amazon Pay, etc.)</span>
                        </div>
                      </div>
                      <div className="razorpay-badges">
                        <SiVisa className="payment-badge" />
                        <SiMastercard className="payment-badge" />
                        <SiGooglepay className="payment-badge" />
                        <SiPaytm className="payment-badge" />
                        <SiPhonepe className="payment-badge" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="secure-payment-badges">
                <FiLock className="secure-badge-icon" />
                <span>100% Secure & Encrypted</span>
                <div className="payment-icons">
                  <SiVisa />
                  <SiMastercard />
                  <SiGooglepay />
                  <SiPaytm />
                  <SiPhonepe />
                </div>
              </div>
            </div>
          </div>

          {/* =========================
              RIGHT SECTION - ORDER SUMMARY
          ========================== */}
          <div className="checkout-right">
            <div className="summary-card">
              <div className="summary-header">
                <h2 className="summary-title">Order Summary</h2>
                <span className="summary-items-count">{cart.total_items} items</span>
              </div>

              {/* Products */}
              <div className="summary-products">
                {cart.cart_items.map((item) => (
                  <div className="summary-product" key={item.cart_item_id}>
                    <div className="product-image-wrapper">
                      <img src={item.product_image} alt={item.product_name} className="product-image" />
                      <span className="product-quantity-badge">{item.quantity}</span>
                    </div>
                    <div className="product-details">
                      <h4 className="product-name">{item.product_name}</h4>
                      {item.variant_capacity && (
                        <p className="product-variant">Size: {item.variant_capacity}</p>
                      )}
                    </div>
                    <span className="product-price">₹{item.subtotal_discount_price}</span>
                  </div>
                ))}
              </div>

              {/* Price Details */}
              <div className="price-breakdown">
                <div className="price-row">
                  <span className="price-label">Items ({cart.total_items})</span>
                  <span className="price-value">₹{cart.total_original_price}</span>
                </div>
                {cart.total_savings > 0 && (
                  <div className="price-row discount">
                    <span className="price-label">Discount</span>
                    <span className="discount-amount">-₹{cart.total_savings}</span>
                  </div>
                )}
                <div className="price-row">
                  <span className="price-label">Delivery Charges</span>
                  <span className="delivery-free">FREE</span>
                </div>
                <div className="price-divider"></div>
              </div>

              {/* Savings Badge */}
              {cart.total_savings > 0 && (
                <div className="savings-badge">
                  <FiGift className="savings-icon" />
                  <span>You saved ₹{cart.total_savings} on this order</span>
                </div>
              )}

              {/* Total */}
              <div className="total-section">
                <div className="total-label-group">
                  <span className="total-label">Total</span>
                  <span className="total-tax">Inclusive of all taxes</span>
                </div>
                <span className="total-amount">₹{finalAmount}</span>
              </div>

              {/* Delivery Info */}
              <div className="delivery-info">
                <FiClock className="delivery-icon" />
                <div>
                  <p className="delivery-label">Estimated Delivery</p>
                  <p className="delivery-date">15 July, 2025</p>
                  <span className="delivery-free-badge">Free Delivery</span>
                </div>
                <FiTruck className="delivery-truck" />
              </div>

              {/* Secure Payment Footer */}
              <div className="secure-footer">
                <FiLock className="secure-icon" />
                <span>Secure payments powered by Razorpay</span>
              </div>

              {/* Place Order Button */}
              <button
                className="place-order-btn"
                disabled={placingOrder || processingPayment || !selectedAddress}
                onClick={placeOrder}
              >
                {placingOrder ? (
                  <>
                    <span className="btn-loader"></span>
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <span className="btn-text">Place Order</span>
                    <span className="btn-amount">₹{finalAmount}</span>
                    <FaRocket className="btn-rocket" />
                  </>
                )}
              </button>

              {/* Order Summary Footer */}
              <div className="summary-footer">
                <FiShield className="footer-icon" />
                <span>Your order is protected by our secure checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================
          ADDRESS DRAWER
      ========================== */}
      {showAddressDrawer && (
        <div className="drawer-overlay" onClick={() => {
          if (!showForm) {
            setShowAddressDrawer(false);
          }
        }}>
          <div className={`drawer ${isMobile ? 'bottom' : 'side'}`} onClick={(e) => e.stopPropagation()}>
            
            {/* Drawer Header */}
            <div className="drawer-header">
              {showForm ? (
                <>
                  <button className="drawer-back-btn" onClick={closeAddressForm}>
                    <FiArrowLeft />
                  </button>
                  <h3 className="drawer-title">{editingAddress ? "Edit Address" : "Add New Address"}</h3>
                  <button className="drawer-close-btn" onClick={() => {
                    closeAddressForm();
                    setShowAddressDrawer(false);
                  }}>
                    <IoMdClose />
                  </button>
                </>
              ) : (
                <>
                  <h3 className="drawer-title">Select Delivery Address</h3>
                  <button className="drawer-close-btn" onClick={() => setShowAddressDrawer(false)}>
                    <IoMdClose />
                  </button>
                </>
              )}
            </div>

            {showForm ? (
              /* ==========================================
                 ADDRESS FORM INSIDE DRAWER
                 ========================================== */
              <div className="drawer-body form-body">
                <div className="address-form">
                  <div className="form-group">
                    <div className="form-field">
                      <input
                        name="full_name"
                        value={formData.full_name}
                        placeholder=" "
                        onChange={handleChange}
                        className="floating-input"
                        id="full_name"
                      />
                      <label htmlFor="full_name" className="floating-label">Full Name</label>
                      <FiUser className="field-icon" />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <div className="form-field">
                      <input
                        name="phone_number"
                        value={formData.phone_number}
                        placeholder=" "
                        onChange={handleChange}
                        className="floating-input"
                        id="phone_number"
                      />
                      <label htmlFor="phone_number" className="floating-label">Phone Number</label>
                      <FiPhone className="field-icon" />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <div className="form-field">
                      <input
                        name="address_line"
                        value={formData.address_line}
                        placeholder=" "
                        onChange={handleChange}
                        className="floating-input"
                        id="address_line"
                      />
                      <label htmlFor="address_line" className="floating-label">Address Line</label>
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <div className="form-field">
                        <input
                          name="city"
                          value={formData.city}
                          placeholder=" "
                          onChange={handleChange}
                          className="floating-input"
                          id="city"
                        />
                        <label htmlFor="city" className="floating-label">City</label>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <div className="form-field">
                        <input
                          name="state"
                          value={formData.state}
                          placeholder=" "
                          onChange={handleChange}
                          className="floating-input"
                          id="state"
                        />
                        <label htmlFor="state" className="floating-label">State</label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <div className="form-field">
                        <input
                          name="pincode"
                          value={formData.pincode}
                          placeholder=" "
                          onChange={handleChange}
                          className="floating-input"
                          id="pincode"
                        />
                        <label htmlFor="pincode" className="floating-label">Pincode</label>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <div className="form-field">
                        <select
                          name="address_type"
                          value={formData.address_type}
                          onChange={handleChange}
                          className="floating-select"
                          id="address_type"
                        >
                          <option value="Home">Home</option>
                          <option value="Work">Work</option>
                          <option value="Other">Other</option>
                        </select>
                        <label htmlFor="address_type" className="floating-label">Address Type</label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-actions-row">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="is_default"
                        checked={formData.is_default}
                        onChange={handleChange}
                      />
                      <span className="checkbox-custom"></span>
                      Set as default address
                    </label>
                  </div>
                  
                  <div className="form-actions">
                    <button className="btn-secondary" onClick={closeAddressForm}>
                      Cancel
                    </button>
                    <button className="btn-primary" onClick={saveAddress}>
                      {editingAddress ? "Update Address" : "Save Address"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* ==========================================
                 ADDRESS LIST INSIDE DRAWER
                 ========================================== */
              <>
                <div className="drawer-search">
                  <FiSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search saved addresses..."
                    value={searchAddress}
                    onChange={(e) => setSearchAddress(e.target.value)}
                    className="search-input"
                  />
                </div>

                <div className="drawer-body">
                  {filteredAddresses.length > 0 ? (
                    <div className="address-list">
                      {filteredAddresses.map((address) => (
                        <div
                          key={address.address_id}
                          className={`address-item ${selectedAddress === address.address_id ? "selected" : ""}`}
                          onClick={() => {
                            setSelectedAddress(address.address_id);
                            setShowAddressDrawer(false);
                          }}
                        >
                          <div className="address-radio">
                            {selectedAddress === address.address_id ? (
                              <div className="radio-selected"><FiCheck /></div>
                            ) : (
                              <div className="radio-empty" />
                            )}
                          </div>
                          <div className="address-content">
                            <div className="address-name-phone">
                              <span className="addr-name">{address.full_name}</span>
                              <span className="addr-phone">{address.phone_number}</span>
                            </div>
                            <p className="addr-full">
                              {address.address_line}, {address.city}, {address.state} - {address.pincode}
                            </p>
                            <div className="addr-tags">
                              {address.is_default && <span className="tag-default">Default</span>}
                              <span className={`tag-type ${address.address_type.toLowerCase()}`}>
                                {getAddressIcon(address.address_type)}
                                {address.address_type}
                              </span>
                            </div>
                          </div>
                          <div className="address-actions">
                            <button 
                              className="action-btn edit"
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                editAddress(address);
                              }}
                              aria-label="Edit address"
                            >
                              <FiEdit2 />
                            </button>
                            <button 
                              className="action-btn delete"
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                setShowDeleteConfirm(address.address_id);
                              }}
                              aria-label="Delete address"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-addresses-message">
                      <FiAlertCircle className="no-address-icon" />
                      <p>No addresses found</p>
                      <span className="no-address-sub">Add a new address to continue</span>
                    </div>
                  )}
                </div>

                <div className="drawer-footer">
                  <button
                    className="add-address-btn"
                    onClick={openAddAddressForm}
                  >
                    <FiPlus /> Add New Address
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon-wrapper">
              <FiTrash2 className="modal-icon" />
            </div>
            <h3 className="modal-title">Delete Address?</h3>
            <p className="modal-description">This action cannot be undone. Are you sure you want to delete this address?</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowDeleteConfirm(null)}>
                Cancel
              </button>
              <button className="btn-danger" onClick={() => deleteAddress(showDeleteConfirm)}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Processing Overlay */}
      {showOverlay && (
        <div className="payment-overlay">
          <div className="payment-overlay-content">
            <div className="payment-loader">
              <div className="loader-ring"></div>
              <div className="loader-ring-2"></div>
              <div className="loader-ring-3"></div>
            </div>
            <h3 className="payment-status">{loadingText}</h3>
            <p className="payment-hint">Please don't refresh or close this page</p>
            <div className="payment-progress">
              <div className="progress-track">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${(loadingStep / 5) * 100}%`,
                    transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                ></div>
              </div>
              <div className="progress-steps">
                <span className={`step ${loadingStep >= 1 ? 'active' : ''}`}>1</span>
                <span className={`step ${loadingStep >= 2 ? 'active' : ''}`}>2</span>
                <span className={`step ${loadingStep >= 3 ? 'active' : ''}`}>3</span>
                <span className={`step ${loadingStep >= 4 ? 'active' : ''}`}>4</span>
                <span className={`step ${loadingStep >= 5 ? 'active' : ''}`}>5</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default Checkout;