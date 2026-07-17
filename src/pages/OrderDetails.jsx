import { useEffect, useState } from "react";
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
} from "react-icons/fi";

function OrderDetails() {
    const { orderId } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            const token = localStorage.getItem("token");
            // Using your existing API endpoint
            const response = await api.get(`/user/order-details/${orderId}/`);
            setOrder(response.data.order);
        } catch (err) {
            console.log(err);
            // If API doesn't exist yet, simulate from orders list
            // This maintains compatibility with your existing setup
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

    /* -----------------------------------
       Helpers
    ----------------------------------- */
    const getStatusClass = (status) => {
        switch (status) {
            case "DELIVERED":
                return "order-status-badge delivered";
            case "OUT_FOR_DELIVERY":
                return "order-status-badge shipping";
            case "PACKED":
                return "order-status-badge packed";
            case "PLACED":
                return "order-status-badge placed";
            case "CANCELLED":
                return "order-status-badge cancelled";
            default:
                return "order-status-badge";
        }
    };

    const getStatusDisplay = (status) => {
        return status.replaceAll("_", " ");
    };

    const getPaymentClass = (status) => {
        if (status === "SUCCESS") return "payment-status-badge paid";
        if (status === "FAILED") return "payment-status-badge failed";
        if (status === "REFUNDED") return "payment-status-badge refunded";
        return "payment-status-badge pending";
    };

    const getTrackingStepClass = (step) => {
        if (step.done) return "step-marker completed";
        return "step-marker";
    };

    const getTrackingStepTitleClass = (step) => {
        if (step.done) return "step-title completed";
        return "step-title";
    };

    /* -----------------------------------
       Loading State
    ----------------------------------- */
    if (loading) {
        return (
            <div className="order-details-page">
                <Navbar />
                <div className="back-link">
                    <FiChevronLeft />
                    Back to Orders
                </div>
                <div className="order-details-layout">
                    <div className="order-details-main">
                        <div className="skeleton-order" style={{ height: "200px" }}></div>
                        <div className="skeleton-order" style={{ height: "300px" }}></div>
                    </div>
                    <div className="order-sidebar">
                        <div className="skeleton-order" style={{ height: "180px" }}></div>
                        <div className="skeleton-order" style={{ height: "150px" }}></div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="order-details-page">
                <Navbar />
                <div className="orders-empty">
                    <FiPackage />
                    <h2>Order Not Found</h2>
                    <p>We couldn't find the order you're looking for.</p>
                    <button onClick={() => navigate("/orders")}>Back to Orders</button>
                </div>
                <Footer />
            </div>
        );
    }

    /* -----------------------------------
       Main Render
    ----------------------------------- */
    return (
        <div className="order-details-page">
            <Navbar />

            {/* Back Button */}
            <Link to="/orders" className="back-link">
                <FiChevronLeft />
                Back to Orders
            </Link>

            <div className="order-details-layout">
                {/* ==========================
                    MAIN CONTENT
                ========================== */}
                <div className="order-details-main">
                    {/* Order Header */}
                    <div className="order-details-header">
                        <div>
                            <div className="order-id">
                                Order <span>#{order.order_id}</span>
                            </div>
                            <div className="order-date">
                                <FiCalendar />
                                {new Date(order.created_at).toLocaleDateString("en-IN", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                })}
                            </div>
                        </div>
                        <span className={getStatusClass(order.status)}>
                            {getStatusDisplay(order.status)}
                        </span>
                    </div>

                    {/* Product Section */}
                    <div className="product-detail-section">
                        <h3>
                            <FiPackage />
                            Products
                        </h3>
                        {order.items.map((item, index) => (
                            <div key={index} className="product-detail-item">
                                <div className="detail-image">
                                    {item.image ? (
                                        <img src={item.image} alt={item.product_name} />
                                    ) : (
                                        <FiPackage />
                                    )}
                                </div>
                                <div className="detail-info">
                                    <h4>{item.product_name}</h4>
                                    <div className="variant">{item.variant}</div>
                                    <div className="seller">Sold by ClayWare</div>
                                    <div className="price-qty">
                                        <span className="price">₹{item.price}</span>
                                        <span>Qty: {item.quantity}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Tracking Timeline */}
                    <div className="tracking-section">
                        <h3>
                            <FiTruck />
                            Order Tracking
                        </h3>
                        <div className="tracking-timeline">
                            {order.tracking.map((step, index) => (
                                <div key={index} className="tracking-step-vertical">
                                    <div className={getTrackingStepClass(step)}>
                                        {step.done ? <FiCheck /> : <FiClock />}
                                    </div>
                                    <div className="step-content">
                                        <div className={getTrackingStepTitleClass(step)}>
                                            {step.stage}
                                        </div>
                                        <div className="step-date">
                                            {step.date || "In progress"}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="order-actions-bottom">
                        <button className="action-btn action-btn-primary">
                            <FiRefreshCw />
                            Buy Again
                        </button>

                        <button className="action-btn">
                            <FiTruck />
                            Track Package
                        </button>

                        {order.can_download_invoice && (
                            <button className="action-btn">
                                <FiDownload />
                                Invoice
                            </button>
                        )}

                        {order.can_cancel && (
                            <button className="action-btn action-btn-danger">
                                <FiXCircle />
                                Cancel Order
                            </button>
                        )}

                        {order.can_return && (
                            <button className="action-btn">
                                <FiRotateCcw />
                                Return Product
                            </button>
                        )}

                        <button className="action-btn action-btn-outline">
                            <FiStar />
                            Write Review
                        </button>
                    </div>

                    {/* Review Section (if delivered) */}
                    {order.status === "DELIVERED" && (
                        <div className="review-section">
                            <h3>
                                <FiStar />
                                Rate Your Purchase
                            </h3>
                            <div className="stars">★★★★★</div>
                            <div className="review-actions">
                                <button>
                                    <FiStar />
                                    Write Review
                                </button>
                                <button>
                                    <FiEye />
                                    View Product
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ==========================
                    SIDEBAR
                ========================== */}
                <div className="order-sidebar">
                    {/* Address Card */}
                    <div className="sidebar-card">
                        <h4>
                            <FiMapPin />
                            Delivery Address
                        </h4>
                        {order.address ? (
                            <>
                                <p>
                                    <strong>{order.address.full_name}</strong>
                                </p>
                                <p className="address-line">{order.address.address_line}</p>
                                <p className="address-line">
                                    {order.address.city}, {order.address.state}
                                </p>
                                <p className="address-line">PIN: {order.address.pincode}</p>
                                <p className="address-line">
                                    <FiPhone style={{ display: "inline", marginRight: "6px" }} />
                                    {order.address.phone_number}
                                </p>
                            </>
                        ) : (
                            <p>No address available</p>
                        )}
                    </div>

                    {/* Payment Card */}
                    <div className="sidebar-card">
                        <h4>
                            <FiCreditCard />
                            Payment Details
                        </h4>
                        <p>
                            <strong>Method:</strong> {order.payment_method}
                        </p>
                        <p>
                            <strong>Status:</strong>{" "}
                            <span className={getPaymentClass(order.payment_status)}>
                                {order.payment_status}
                            </span>
                        </p>
                        <p>
                            <strong>Transaction ID:</strong>{" "}
                            {order.transaction_id || "N/A"}
                        </p>
                        <p>
                            <strong>Refund Status:</strong>{" "}
                            {order.refund_status || "Not Applicable"}
                        </p>
                        <p>
                            <strong>Total Amount:</strong> ₹{order.total_price}
                        </p>
                    </div>

                    {/* Delivery Card */}
                    <div className="sidebar-card">
                        <h4>
                            <FiTruck />
                            Delivery Info
                        </h4>
                        <p>
                            <strong>Partner:</strong> {order.delivery_partner}
                        </p>
                        <p>
                            <strong>Tracking:</strong> {order.tracking_number || "N/A"}
                        </p>
                        <p>
                            <strong>Expected:</strong> {order.expected_delivery}
                        </p>
                        <p>
                            <strong>Current:</strong> {order.current_location}
                        </p>
                    </div>

                    {/* Invoice Card */}
                    <div className="sidebar-card">
                        <h4>
                            <FiFileText />
                            Invoice
                        </h4>
                        <p>
                            <strong>Invoice #:</strong> INV-{order.order_id}
                        </p>
                        <button className="invoice-btn-sidebar">
                            <FiDownload />
                            Download Invoice
                        </button>
                    </div>

                    {/* Support Card */}
                    <div className="sidebar-card">
                        <h4>
                            <FiHelpCircle />
                            Need Help?
                        </h4>
                        <div className="support-buttons">
                            <button>
                                <FiMessageCircle style={{ display: "inline", marginRight: "8px" }} />
                                Chat With Us
                            </button>
                            <button>
                                <FiMail style={{ display: "inline", marginRight: "8px" }} />
                                Email Support
                            </button>
                            <button>
                                <FiHome style={{ display: "inline", marginRight: "8px" }} />
                                Help Center
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default OrderDetails;