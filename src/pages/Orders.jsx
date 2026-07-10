import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";


import "./styles/orders.css";

import {
    FiPackage,
    FiCheck,
    FiClock,
    FiTruck,
    FiCreditCard,
    FiShoppingBag,
    FiRefreshCw,
    FiDownload,
    FiChevronDown,
    FiMapPin,
    FiCalendar,
    FiRotateCcw,
    FiXCircle,
    FiEye,
} from "react-icons/fi";


function Orders() {

    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Which order is expanded
    const [expandedOrder, setExpandedOrder] = useState(null);

    useEffect(() => {

        fetchOrders();

    }, []);

    const fetchOrders = async () => {

        try {

            const token = localStorage.getItem("token");

            const response = await axios.get(

                "https://claywarebackend.onrender.com/api/user/user-order-history/",

                {
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                }

            );

            setOrders(response.data.orders || []);

        } catch (err) {

            console.log(err);

            setOrders([]);

        } finally {

            setLoading(false);

        }

    };

    /* -----------------------------------
       Expand / Collapse
    ----------------------------------- */

    const toggleOrder = (id) => {

        if (expandedOrder === id) {

            setExpandedOrder(null);

        } else {

            setExpandedOrder(id);

        }

    };

    /* -----------------------------------
       Order Status
    ----------------------------------- */

    const getStatusClass = (status) => {

        switch (status) {

            case "DELIVERED":
                return "status delivered";

            case "OUT_FOR_DELIVERY":
                return "status shipping";

            case "PACKED":
                return "status packed";

            case "PLACED":
                return "status placed";

            case "CANCELLED":
                return "status cancelled";

            default:
                return "status";
        }

    };

    /* -----------------------------------
       Payment Status
    ----------------------------------- */

    const paymentClass = (status) => {

        if (status === "SUCCESS")
            return "paid";

        if (status === "FAILED")
            return "failed";

        return "pending";

    };

    /* -----------------------------------
       Loading
    ----------------------------------- */

    if (loading) {

        return (

            <div className="orders-loading">

                <div className="loader"></div>

                <h2>Loading your Orders...</h2>

            </div>

        );

    }

    /* -----------------------------------
       Empty Orders
    ----------------------------------- */

    if (orders.length === 0) {

        return (

            <div className="orders-empty">

                <FiShoppingBag />

                <h2>No Orders Yet</h2>

                <p>

                    Looks like you haven't purchased
                    anything yet.

                </p>

                <button
                    onClick={() => navigate("/shop")}
                >

                    Continue Shopping

                </button>

            </div>

        );

    }

    return (

        <div className="orders-page">

            <Navbar/>

            <div className="orders-header">

                <div>

                    <h1>

                        <FiPackage />

                        My Orders

                    </h1>

                    <p>

                        {orders.length} Order
                        {orders.length > 1 ? "s" : ""}

                    </p>

                </div>

            </div>

            <div className="orders-container">
                {orders.map((order) => (

    <div
        key={order.order_id}
        className={`modern-order-card ${
            expandedOrder === order.order_id
                ? "expanded"
                : ""
        }`}
    >

        {/* ==========================
            TOP
        =========================== */}

        <div className="order-card-top">

            <div>

                <div className="order-number">

                    Order #{order.order_id}

                </div>

                <div className="order-price">

                    ₹ {order.total_price}

                </div>

                <div className="order-date">

                    <FiCalendar />

                    {new Date(
                        order.created_at
                    ).toLocaleDateString()}

                </div>

            </div>

            <div
                className={getStatusClass(
                    order.status
                )}
            >

                {order.status.replaceAll(
                    "_",
                    " "
                )}

            </div>

        </div>

        {/* ==========================
            PRODUCTS
        =========================== */}

        <div className="products-list">

            {order.items.map((item, index) => (

                <div
                    className="product-card"
                    key={index}
                >

                    <div className="product-image">

                        {item.image ? (

                            <img
                                src={item.image}
                                alt={item.product_name}
                            />

                        ) : (

                            <FiPackage />

                        )}

                    </div>

                    <div className="product-details">

                        <h3>

                            {item.product_name}

                        </h3>

                        <span>

                            {item.variant}

                        </span>

                    </div>

                    <div className="product-qty">

                        Qty {item.quantity}

                    </div>

                    <div className="product-price">

                        ₹ {item.price}

                    </div>

                </div>

            ))}

        </div>

        {/* ==========================
            TRACKING
        =========================== */}

        <div className="tracking-bar">

            {order.tracking.map((step, index) => (

                <div
                    key={index}
                    className="tracking-item"
                >

                    <div
                        className={
                            step.done
                                ? "tracking-circle active"
                                : "tracking-circle"
                        }
                    >

                        {step.done ? (

                            <FiCheck />

                        ) : (

                            <FiClock />

                        )}

                    </div>

                    <small>

                        {step.stage}

                    </small>

                    {index !==
                        order.tracking.length - 1 && (

                        <div
                            className={
                                step.done
                                    ? "tracking-line active"
                                    : "tracking-line"
                            }
                        />

                    )}

                </div>

            ))}

        </div>

        {/* ==========================
            QUICK INFO
        =========================== */}

        <div className="quick-info">

            <div className="payment-chip">

                <FiCreditCard />

                {order.payment_method}

            </div>

            <div
                className={`payment-status ${paymentClass(
                    order.payment_status
                )}`}
            >

                {order.payment_status}

            </div>

            <div className="delivery-chip">

                <FiTruck />

                {order.current_location}

            </div>

        </div>

        {/* ==========================
            VIEW DETAILS BUTTON
        =========================== */}

        <button

            className="details-btn"

            onClick={(e) => {

                e.stopPropagation();

                toggleOrder(order.order_id);

            }}

        >

            <FiEye />

            {expandedOrder === order.order_id
                ? "Hide Details"
                : "View Details"}

            <FiChevronDown
                className={
                    expandedOrder === order.order_id
                        ? "rotate"
                        : ""
                }
            />

        </button>

        {/* ==========================
            EXPANDABLE SECTION
            Part 3 Starts Here
        =========================== */}

        <div
            className={`expand-content ${
                expandedOrder === order.order_id
                    ? "expanded"
                    : ""
            }`}
        >
                        {/* ==========================
                DELIVERY DETAILS
            ========================== */}

            <div className="details-grid">

                <div className="detail-card">

                    <h4>

                        <FiMapPin />

                        Delivery Address

                    </h4>

                    {order.address ? (

                        <>
                            <strong>

                                {order.address.full_name}

                            </strong>

                            <p>

                                {order.address.address_line}

                            </p>

                            <p>

                                {order.address.city},{" "}
                                {order.address.state}

                            </p>

                            <p>

                                {order.address.pincode}

                            </p>

                            <p>

                                {order.address.phone_number}

                            </p>
                        </>

                    ) : (

                        <p>No Address Available</p>

                    )}

                </div>

                <div className="detail-card">

                    <h4>

                        <FiTruck />

                        Delivery Information

                    </h4>

                    <p>

                        <strong>Partner :</strong>

                        {order.delivery_partner}

                    </p>

                    <p>

                        <strong>Current :</strong>

                        {order.current_location}

                    </p>

                    <p>

                        <strong>Expected :</strong>

                        {order.expected_delivery}

                    </p>

                </div>

                <div className="detail-card">

                    <h4>

                        <FiCreditCard />

                        Payment

                    </h4>

                    <p>

                        <strong>Method :</strong>

                        {order.payment_method}

                    </p>

                    <p>

                        <strong>Status :</strong>

                        <span
                            className={`payment-status ${paymentClass(
                                order.payment_status
                            )}`}
                        >

                            {order.payment_status}

                        </span>

                    </p>

                    <p>

                        <strong>Total :</strong>

                        ₹ {order.total_price}

                    </p>

                </div>

            </div>

            {/* ==========================
                ACTION BUTTONS
            ========================== */}

            <div className="footer-buttons">

                <button
                    className="buy-btn"
                    onClick={() => navigate("/shop")}
                >

                    <FiRefreshCw />

                    Buy Again

                </button>

                {order.can_download_invoice && (

                    <button
                        className="invoice-btn"
                    >

                        <FiDownload />

                        Invoice

                    </button>

                )}

                {order.can_cancel && (

                    <button
                        className="cancel-btn"
                    >

                        <FiXCircle />

                        Cancel Order

                    </button>

                )}

                {order.can_return && (

                    <button
                        className="return-btn"
                    >

                        <FiRefreshCw />

                        Return Product

                    </button>

                )}

            </div>

        </div>

    </div>

))}

            </div>

            {/* ==========================
                SUMMARY
            ========================== */}

            <div className="orders-footer-summary">

                <div className="summary-card">

                    <h4>

                        Total Orders

                    </h4>

                    <span>

                        {orders.length}

                    </span>

                </div>

                <div className="summary-card">

                    <h4>

                        Total Purchased

                    </h4>

                    <span>

                        ₹ {

                            orders.reduce(

                                (sum, order) =>

                                    sum +
                                    Number(order.total_price),

                                0

                            )

                        }

                    </span>

                </div>
<footer/>
            </div>
            

        </div>

    );

}

export default Orders;
                