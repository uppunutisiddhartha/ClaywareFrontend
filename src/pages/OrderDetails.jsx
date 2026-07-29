import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./styles/orderDetails.css";

import {
  FiPackage,
  FiChevronLeft,
  FiCalendar,
  FiMapPin,
  FiCreditCard,
  FiTruck,
  FiFileText,
  FiCheck,
  FiClock,
  FiRefreshCw,
  FiDownload,
  FiXCircle,
  FiRotateCcw,
  FiStar,
  FiHome,
  FiPhone,
  FiMail,
  FiHelpCircle,
  FiMessageCircle,
  FiEye,
  FiShare2,
  FiHeart,
  FiShoppingBag,
  FiArrowRight,
  FiDollarSign,
  FiPercent,
  FiTruck as FiTruck2,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiClock as FiClock2,
  FiMap,
  FiCopy,
  FiPrinter,
  FiChevronRight,
  FiChevronLeft as FiChevronLeft2,
  FiMoreHorizontal,
  FiExternalLink,
  FiAward,
  FiShield,
  FiZap,
  FiUser,
  FiTag,
  FiBox,
  FiShoppingCart,
} from "react-icons/fi";

// ============================================
// LOADING SKELETON
// ============================================
const OrderDetailsSkeleton = () => (
  <div className="ods-page">
    <div className="ods-container">
      <div className="ods-skeleton-nav" />
      <div className="ods-skeleton-hero" />
      <div className="ods-grid">
        <div className="ods-grid-main">
          <div className="ods-skeleton-section" style={{ height: "300px" }} />
          <div className="ods-skeleton-section" style={{ height: "250px" }} />
          <div className="ods-skeleton-section" style={{ height: "120px" }} />
        </div>
        <div className="ods-grid-sidebar">
          <div className="ods-skeleton-card" style={{ height: "180px" }} />
          <div className="ods-skeleton-card" style={{ height: "160px" }} />
          <div className="ods-skeleton-card" style={{ height: "140px" }} />
          <div className="ods-skeleton-card" style={{ height: "120px" }} />
        </div>
      </div>
    </div>
  </div>
);

// ============================================
// EMPTY STATE
// ============================================
const EmptyState = ({ onBack }) => (
  <div className="ods-page">
    <div className="ods-container">
      <div className="ods-empty">
        <div className="ods-empty-icon">
          <FiPackage />
        </div>
        <h2>Order Not Found</h2>
        <p>We couldn't locate this order. It may have been removed or the ID is incorrect.</p>
        <button onClick={onBack} className="ods-btn-primary">
          <FiChevronLeft size={18} />
          Back to Orders
        </button>
      </div>
    </div>
  </div>
);

// ============================================
// STATUS BADGE
// ============================================
const StatusBadge = ({ status, date }) => {
  const configs = {
    DELIVERED: { 
      label: "Delivered", 
      icon: FiCheckCircle, 
      class: "delivered",
      bg: "#2a7d4e",
      light: "#edf5f0"
    },
    OUT_FOR_DELIVERY: { 
      label: "Out for Delivery", 
      icon: FiTruck2, 
      class: "shipping",
      bg: "#3a7a9a",
      light: "#edf2f5"
    },
    PACKED: { 
      label: "Packed", 
      icon: FiPackage, 
      class: "packed",
      bg: "#c97d3a",
      light: "#f9f0e8"
    },
    PLACED: { 
      label: "Placed", 
      icon: FiClock2, 
      class: "placed",
      bg: "#7a5c8a",
      light: "#f2edf5"
    },
    CANCELLED: { 
      label: "Cancelled", 
      icon: FiXCircle, 
      class: "cancelled",
      bg: "#b85a4a",
      light: "#f5eeec"
    },
  };
  
  const config = configs[status] || { 
    label: status?.replace("_", " ") || "Unknown", 
    icon: FiInfo, 
    class: "",
    bg: "#94887d",
    light: "#f3efea"
  };
  
  const Icon = config.icon;
  
  return (
    <div className={`ods-status-card ${config.class}`}>
      <div className="ods-status-icon" style={{ background: config.bg }}>
        <Icon size={20} color="white" />
      </div>
      <div className="ods-status-content">
        <span className="ods-status-label">{config.label}</span>
        {date && <span className="ods-status-date">{date}</span>}
      </div>
    </div>
  );
};

// ============================================
// PAYMENT BADGE
// ============================================
const PaymentBadge = ({ status }) => {
  const configs = {
    SUCCESS: { label: "Paid", class: "paid" },
    FAILED: { label: "Failed", class: "failed" },
    REFUNDED: { label: "Refunded", class: "refunded" },
    PENDING: { label: "Pending", class: "pending" },
  };
  const config = configs[status] || { label: status, class: "" };
  return <span className={`ods-payment-badge ${config.class}`}>{config.label}</span>;
};

// ============================================
// TIMELINE ITEM
// ============================================
const TimelineItem = ({ step, index, isLast }) => {
  const isCompleted = step.done;
  const isActive = index === 0 && !isCompleted;
  
  return (
    <div className={`ods-timeline-item ${isCompleted ? "completed" : ""} ${isActive ? "active" : ""}`}>
      <div className="ods-timeline-marker">
        {isCompleted ? <FiCheck size={14} /> : <FiClock size={14} />}
        {!isLast && <div className="ods-timeline-line" />}
      </div>
      <div className="ods-timeline-content">
        <div className="ods-timeline-title">{step.stage}</div>
        <div className="ods-timeline-date">{step.date || "In Progress"}</div>
      </div>
    </div>
  );
};

// ============================================
// PRODUCT CARD
// ============================================
const ProductCard = ({ item }) => (
  <div className="ods-product">
    <div className="ods-product-image-wrapper">
      <div className="ods-product-image">
        {item.image ? (
          <img src={item.image} alt={item.product_name} />
        ) : (
          <div className="ods-product-image-placeholder">
            <FiPackage size={32} />
          </div>
        )}
      </div>
      <button className="ods-product-wishlist" aria-label="Add to wishlist">
        <FiHeart size={16} />
      </button>
    </div>
    <div className="ods-product-details">
      <h4 className="ods-product-name">{item.product_name}</h4>
      <div className="ods-product-variant">{item.variant}</div>
      <div className="ods-product-seller">
        <span>Sold by</span>
        <strong>ClayWare</strong>
        <span className="ods-product-rating">⭐ 4.8</span>
      </div>
      <div className="ods-product-bottom">
        <div className="ods-product-price">
          <span className="ods-price-amount">₹{item.price}</span>
          <span className="ods-price-qty">Qty: {item.quantity}</span>
        </div>
        <div className="ods-product-actions">
          <button className="ods-btn-sm ods-btn-primary">Buy Again</button>
          <button className="ods-btn-sm ods-btn-outline">
            <FiStar size={14} />
            Review
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ============================================
// SIDEBAR CARD
// ============================================
const SidebarCard = ({ icon: Icon, title, children, className = "" }) => (
  <div className={`ods-sidebar-card ${className}`}>
    <div className="ods-sidebar-header">
      <Icon size={18} />
      <h4>{title}</h4>
    </div>
    <div className="ods-sidebar-body">{children}</div>
  </div>
);

// ============================================
// INFO ROW
// ============================================
const InfoRow = ({ label, value, highlight = false }) => (
  <div className={`ods-info-row ${highlight ? "highlight" : ""}`}>
    <span className="ods-info-label">{label}</span>
    <span className="ods-info-value">{value || "N/A"}</span>
  </div>
);

// ============================================
// MAIN COMPONENT
// ============================================
function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showShare, setShowShare] = useState(false);
  const shareRef = useRef(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get(`/user/order-details/${orderId}/`);
      setOrder(response.data.order);
    } catch (err) {
      console.log(err);
      try {
        const allOrdersResponse = await api.get("/user/user-order-history/");
        const foundOrder = allOrdersResponse.data.orders.find(
          (o) => o.order_id === parseInt(orderId)
        );
        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          navigate("/orders");
        }
      } catch (e) {
        navigate("/orders");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAddress = useCallback(() => {
    if (!order?.address) return;
    const addr = `${order.address.full_name}\n${order.address.address_line}\n${order.address.city}, ${order.address.state}\nPIN: ${order.address.pincode}\nPhone: ${order.address.phone_number}`;
    navigator.clipboard?.writeText(addr);
  }, [order]);

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: `Order #${order?.order_id}`,
        text: `Check out my order #${order?.order_id} on ClayWare`,
        url: window.location.href,
      });
    } else {
      setShowShare(!showShare);
    }
  }, [order, showShare]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (shareRef.current && !shareRef.current.contains(e.target)) {
        setShowShare(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) return <OrderDetailsSkeleton />;
  if (!order) return <EmptyState onBack={() => navigate("/orders")} />;

  const status = order.status || "PLACED";
  const paymentStatus = order.payment_status || "PENDING";
  const isDelivered = status === "DELIVERED";
  const trackingSteps = order.tracking || [];
  const hasTracking = trackingSteps.length > 0;
  const totalItems = order.items?.length || 0;

  return (
    <div className="ods-page">
      <Navbar />

      <div className="ods-container">
        {/* ===== BREADCRUMB ===== */}
        <div className="ods-breadcrumb">
          <Link to="/">Home</Link>
          <FiChevronRight size={14} />
          <Link to="/orders">My Orders</Link>
          <FiChevronRight size={14} />
          <span>Order #{order.order_id}</span>
        </div>

        {/* ===== TOP BAR ===== */}
        <div className="ods-topbar">
          <div className="ods-topbar-left">
            <button className="ods-topbar-back" onClick={() => navigate("/orders")}>
              <FiChevronLeft size={20} />
              <span>Back to Orders</span>
            </button>
          </div>
          <div className="ods-topbar-right">
            <button className="ods-topbar-btn" onClick={handleShare} ref={shareRef}>
              <FiShare2 size={18} />
              Share
              {showShare && (
                <div className="ods-share-dropdown">
                  <button onClick={() => navigator.clipboard?.writeText(window.location.href)}>
                    <FiCopy size={14} />
                    Copy Link
                  </button>
                  <button onClick={() => window.print()}>
                    <FiPrinter size={14} />
                    Print
                  </button>
                </div>
              )}
            </button>
            <button className="ods-topbar-btn" onClick={() => window.print()}>
              <FiPrinter size={18} />
              Print
            </button>
          </div>
        </div>

        {/* ===== HERO HEADER ===== */}
        <div className="ods-hero">
          <div className="ods-hero-main">
            <div className="ods-hero-header">
              <div className="ods-hero-order">
                <span className="ods-hero-order-label">Order</span>
                <span className="ods-hero-order-number">#{order.order_id}</span>
              </div>
              <div className="ods-hero-meta">
                <span className="ods-hero-meta-item">
                  <FiCalendar size={14} />
                  {new Date(order.created_at).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span className="ods-hero-meta-item">
                  <FiShoppingBag size={14} />
                  {totalItems} {totalItems === 1 ? "item" : "items"}
                </span>
                {order.total_price && (
                  <span className="ods-hero-meta-item ods-hero-total">
                    ₹{order.total_price}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="ods-hero-status">
            <StatusBadge 
              status={status} 
              date={isDelivered ? "Delivered on 16 May 2024" : "Expected by 16 May 2024"}
            />
          </div>
        </div>

        {/* ===== MAIN GRID ===== */}
        <div className="ods-grid">
          {/* ----- LEFT COLUMN ----- */}
          <div className="ods-grid-main">

            {/* ---- Products ---- */}
            <section className="ods-section">
              <div className="ods-section-header">
                <h2 className="ods-section-title">
                  <FiPackage size={20} />
                  Products
                  <span className="ods-section-count">{totalItems} items</span>
                </h2>
              </div>
              <div className="ods-products">
                {order.items?.map((item, index) => (
                  <ProductCard key={index} item={item} />
                ))}
              </div>
            </section>

            {/* ---- Review CTA ---- */}
            {isDelivered && (
              <div className="ods-review-cta">
                <div className="ods-review-cta-content">
                  <div className="ods-review-cta-icon">
                    <FiStar size={24} />
                  </div>
                  <div className="ods-review-cta-text">
                    <h3>Enjoyed your purchase?</h3>
                    <p>Rate your products and share your experience</p>
                  </div>
                  <button className="ods-btn-primary">
                    <FiStar size={18} />
                    Write a Review
                  </button>
                </div>
              </div>
            )}

            {/* ---- Timeline ---- */}
            {hasTracking && (
              <section className="ods-section">
                <div className="ods-section-header">
                  <h2 className="ods-section-title">
                    <FiTruck size={20} />
                    Order Timeline
                  </h2>
                  <span className="ods-section-status">
                    {trackingSteps.filter(s => s.done).length} of {trackingSteps.length} completed
                  </span>
                </div>
                <div className="ods-timeline">
                  {trackingSteps.map((step, index) => (
                    <TimelineItem
                      key={index}
                      step={step}
                      index={index}
                      isLast={index === trackingSteps.length - 1}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* ---- You May Also Like ----
            <section className="ods-section ods-recommendations">
              <div className="ods-section-header">
                <h2 className="ods-section-title">
                  <FiZap size={20} />
                  You May Also Like
                </h2>
              </div>
              <div className="ods-recommendations-grid">
                <div className="ods-recommendation-item">
                  <div className="ods-recommendation-image" />
                  <h4>Terracotta Water Bottle</h4>
                  <div className="ods-recommendation-price">₹699.00</div>
                  <div className="ods-recommendation-rating">⭐ 4.8 (128)</div>
                  <button className="ods-btn-sm ods-btn-outline">View Product</button>
                </div>
                <div className="ods-recommendation-item">
                  <div className="ods-recommendation-image" />
                  <h4>Clay Incense Holder</h4>
                  <div className="ods-recommendation-price">₹299.00</div>
                  <div className="ods-recommendation-rating">⭐ 4.6 (84)</div>
                  <button className="ods-btn-sm ods-btn-outline">View Product</button>
                </div>
                <div className="ods-recommendation-item">
                  <div className="ods-recommendation-image" />
                  <h4>Handmade Clay Bowl</h4>
                  <div className="ods-recommendation-price">₹499.00</div>
                  <div className="ods-recommendation-rating">⭐ 4.7 (156)</div>
                  <button className="ods-btn-sm ods-btn-outline">View Product</button>
                </div>
              </div>
            </section> */}

            {/* ---- Perks ---- */}
            <div className="ods-perks">
              <div className="ods-perk">
                <FiShield size={20} />
                <div>
                  <strong>Secure Payments</strong>
                  <span>100% secure payments</span>
                </div>
              </div>
              <div className="ods-perk">
                <FiRefreshCw size={20} />
                <div>
                  <strong>Easy Returns</strong>
                  <span>7-day return policy</span>
                </div>
              </div>
              <div className="ods-perk">
                <FiTruck size={20} />
                <div>
                  <strong>Free Shipping</strong>
                  <span>On orders above ₹999</span>
                </div>
              </div>
              <div className="ods-perk">
                <FiHelpCircle size={20} />
                <div>
                  <strong>Customer Support</strong>
                  <span>24/7 support available</span>
                </div>
              </div>
            </div>
          </div>

          {/* ----- RIGHT COLUMN - SIDEBAR ----- */}
          <div className="ods-grid-sidebar">

            {/* ---- Address ---- */}
            <SidebarCard icon={FiMapPin} title="Delivery Address">
              {order.address ? (
                <div className="ods-address">
                  <div className="ods-address-name">{order.address.full_name}</div>
                  <div className="ods-address-line">{order.address.address_line}</div>
                  <div className="ods-address-line">
                    {order.address.city}, {order.address.state}
                  </div>
                  <div className="ods-address-line">PIN: {order.address.pincode}</div>
                  <div className="ods-address-phone">
                    <FiPhone size={14} />
                    {order.address.phone_number}
                  </div>
                  <button className="ods-address-copy" onClick={handleCopyAddress}>
                    <FiCopy size={14} />
                    Copy Address
                  </button>
                  <button className="ods-address-map">
                    <FiMap size={14} />
                    View on Map
                  </button>
                </div>
              ) : (
                <p className="ods-empty-text">No address available</p>
              )}
            </SidebarCard>

            {/* ---- Payment ---- */}
            <SidebarCard icon={FiCreditCard} title="Payment Details">
              <InfoRow label="Payment Method" value={order.payment_method} />
              <InfoRow label="Payment Status" value={<PaymentBadge status={paymentStatus} />} />
              <InfoRow label="Transaction ID" value={order.transaction_id} />
              <InfoRow label="Refund Status" value={order.refund_status || "Not Applicable"} />
              <div className="ods-info-row highlight">
                <span className="ods-info-label">Paid Amount</span>
                <span className="ods-info-value ods-amount">₹{order.total_price}</span>
              </div>
            </SidebarCard>

            {/* ---- Delivery ---- */}
            <SidebarCard icon={FiTruck} title="Delivery Details">
              <InfoRow label="Delivery Partner" value={order.delivery_partner || "ClayWare"} />
              <InfoRow label="Tracking ID" value={order.tracking_number} />
              <InfoRow label="Expected Delivery" value={order.expected_delivery} />
              {isDelivered && (
                <InfoRow label="Delivered On" value={order.delivered_date || "16 May 2024, 02:15 PM"} />
              )}
            </SidebarCard>

            {/* ---- Order Summary ---- */}
            <SidebarCard icon={FiShoppingBag} title="Order Summary">
              <div className="ods-summary">
                <InfoRow label={`Subtotal (${totalItems} items)`} value={`₹${order.total_price}`} />
                <InfoRow label="Discount" value="-₹100.00" />
                <InfoRow label="Shipping Charges" value="FREE" highlight />
                <InfoRow label="Tax (GST 5%)" value="₹89.86" />
                <div className="ods-summary-divider" />
                <div className="ods-summary-total">
                  <span>Total Amount</span>
                  <span>₹{order.total_price}</span>
                </div>
                <div className="ods-summary-saved">
                  <FiAward size={14} />
                  You saved ₹100.00 on this order
                </div>
              </div>
            </SidebarCard>

            {/* ---- Support ---- */}
            <SidebarCard icon={FiHelpCircle} title="Need Help?">
              <p className="ods-support-text">We're here to help you</p>
              <div className="ods-support-grid">
                <button className="ods-support-btn">
                  <FiMessageCircle size={18} />
                  <span>Chat with us</span>
                  <small>Usually replies in a few minutes</small>
                </button>
                <button className="ods-support-btn">
                  <FiPhone size={18} />
                  <span>Call us</span>
                  <small>+91 9030425546</small>
                </button>
                <button className="ods-support-btn">
                  <FiMail size={18} />
                  <span>Email us</span>
                  <small>support@clayware.com</small>
                </button>
                <button className="ods-support-btn">
                  <FiHome size={18} />
                  <span>Visit Help Center</span>
                  <small>Find answers to common questions</small>
                </button>
              </div>
            </SidebarCard>

            {/* ---- Perk Banner ---- */}
            <div className="ods-perk-banner">
              <FiTruck size={24} />
              <div>
                <strong>Free Shipping</strong>
                <span>On orders above ₹399</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default OrderDetails;