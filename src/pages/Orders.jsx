import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import "./styles/orders.css";

import {
    FiPackage,
    FiShoppingBag,
    FiSearch,
    FiChevronRight,
    FiCalendar,
    FiClock,
} from "react-icons/fi";

function Orders() {
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // UI filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [sortBy, setSortBy] = useState("Newest");

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await api.get("/user/user-order-history/");
            setOrders(response.data.orders || []);
        } catch (err) {
            console.log(err);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    /* -----------------------------------
       Order Status Helpers
    ----------------------------------- */
    const getStatusDisplay = (status) => {
        return status.replaceAll("_", " ");
    };

    const getStatusDot = (status) => {
        switch (status) {
            case "DELIVERED":
                return "dot delivered";
            case "OUT_FOR_DELIVERY":
                return "dot shipping";
            case "PACKED":
                return "dot packed";
            case "PLACED":
                return "dot placed";
            case "CANCELLED":
                return "dot cancelled";
            default:
                return "dot";
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "DELIVERED":
                return "#0d6b3f";
            case "OUT_FOR_DELIVERY":
                return "#1a6a9e";
            case "PACKED":
                return "#b45f1a";
            case "PLACED":
                return "#5e3a9e";
            case "CANCELLED":
                return "#b33c3c";
            default:
                return "#6e665e";
        }
    };

    /* -----------------------------------
       Calculate stats
    ----------------------------------- */
    const totalOrders = orders.length;
    const delivered = orders.filter((o) => o.status === "DELIVERED").length;
    const processing = orders.filter(
        (o) => o.status === "PLACED" || o.status === "PACKED" || o.status === "OUT_FOR_DELIVERY"
    ).length;
    const cancelled = orders.filter((o) => o.status === "CANCELLED").length;

    /* -----------------------------------
       Navigate to Order Details
    ----------------------------------- */
    const handleOrderClick = (orderId) => {
        navigate(`/orders/${orderId}`);
    };

    /* -----------------------------------
       Loading State
    ----------------------------------- */
    if (loading) {
        return (
            <div className="orders-page">
                <Navbar />
                <div className="orders-header">
                    <h1>
                        <FiPackage />
                        My Orders
                    </h1>
                    <p>Loading your orders...</p>
                </div>
                <div className="orders-loading">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="skeleton-order">
                            <div className="skeleton-thumb"></div>
                            <div style={{ flex: 1 }}>
                                <div className="skeleton-line" style={{ width: "60%" }}></div>
                                <div
                                    className="skeleton-line"
                                    style={{ width: "40%", marginTop: "8px" }}
                                ></div>
                                <div
                                    className="skeleton-line short"
                                    style={{ marginTop: "8px" }}
                                ></div>
                            </div>
                            <div style={{ minWidth: "80px" }}>
                                <div className="skeleton-line short"></div>
                                <div
                                    className="skeleton-line"
                                    style={{ width: "60%", marginTop: "8px" }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
                <Footer />
            </div>
        );
    }

    /* -----------------------------------
       Empty State
    ----------------------------------- */
    if (orders.length === 0) {
        return (
            <div className="orders-page">
                <Navbar />
                <div className="orders-empty">
                    <FiShoppingBag />
                    <h2>No Orders Yet</h2>
                    <p>Start exploring beautiful handcrafted clay products.</p>
                    <button onClick={() => navigate("/shop")}>Continue Shopping</button>
                </div>
                <Footer />
            </div>
        );
    }

    /* -----------------------------------
       Filter & Sort Orders
    ----------------------------------- */
    let filteredOrders = [...orders];

    if (filterStatus !== "All") {
        filteredOrders = filteredOrders.filter((o) => o.status === filterStatus);
    }

    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredOrders = filteredOrders.filter(
            (o) =>
                o.order_id.toString().includes(term) ||
                o.items.some((item) => item.product_name.toLowerCase().includes(term)) ||
                new Date(o.created_at).toLocaleDateString().includes(term)
        );
    }

    // Sort
    switch (sortBy) {
        case "Newest":
            filteredOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
        case "Oldest":
            filteredOrders.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            break;
        case "Price High-Low":
            filteredOrders.sort((a, b) => Number(b.total_price) - Number(a.total_price));
            break;
        case "Price Low-High":
            filteredOrders.sort((a, b) => Number(a.total_price) - Number(b.total_price));
            break;
        default:
            break;
    }

    /* -----------------------------------
       Main Render
    ----------------------------------- */
    return (
        <div className="orders-page">
            <Navbar />

            {/* ==========================
                HEADER
            ========================== */}
            <div className="orders-header">
                <div>
                    <h1>
                        <FiPackage />
                        My Orders
                    </h1>
                    <p>
                        {filteredOrders.length} Order{filteredOrders.length > 1 ? "s" : ""}
                        {filteredOrders.length !== orders.length
                            ? ` (${orders.length} total)`
                            : ""}
                    </p>
                </div>

                <div className="stats-bar">
                    <div className="stat">
                        Total <span>{totalOrders}</span>
                    </div>
                    <div className="stat">
                        Delivered <span className="clay-num">{delivered}</span>
                    </div>
                    <div className="stat">
                        Processing <span>{processing}</span>
                    </div>
                    <div className="stat">
                        Cancelled <span>{cancelled}</span>
                    </div>
                </div>
            </div>

            {/* ==========================
                SEARCH & FILTER
            ========================== */}
            <div className="search-filter-row">
                <div className="search-box-compact">
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Search orders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        aria-label="Search orders"
                    />
                </div>

                <div className="filter-chips">
                    {["All", "PLACED", "PACKED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"].map(
                        (status) => (
                            <button
                                key={status}
                                className={`filter-chip ${
                                    filterStatus === status ? "active" : ""
                                }`}
                                onClick={() => setFilterStatus(status)}
                                aria-label={`Filter by ${status}`}
                            >
                                {status === "All" ? "All" : getStatusDisplay(status)}
                            </button>
                        )
                    )}
                </div>

                <select
                    className="sort-select-compact"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    aria-label="Sort orders"
                >
                    <option value="Newest">Newest</option>
                    <option value="Oldest">Oldest</option>
                    <option value="Price High-Low">Price: High-Low</option>
                    <option value="Price Low-High">Price: Low-High</option>
                </select>
            </div>

            {/* ==========================
                ORDERS LIST
            ========================== */}
            <div className="orders-list">
                {filteredOrders.map((order) => {
                    const firstItem = order.items[0];
                    const remainingCount = order.items.length - 1;

                    return (
                        <div
                            key={order.order_id}
                            className="order-card-compact"
                            onClick={() => handleOrderClick(order.order_id)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    handleOrderClick(order.order_id);
                                }
                            }}
                            aria-label={`Order #${order.order_id}`}
                        >
                            <div className="order-main">
                                {/* Product Image */}
                                <div className="product-thumb">
                                    {firstItem?.image ? (
                                        <img src={firstItem.image} alt={firstItem.product_name} />
                                    ) : (
                                        <FiPackage />
                                    )}
                                </div>

                                {/* Product Info */}
                                <div className="product-info">
                                    <h3>{firstItem?.product_name || "Product"}</h3>
                                    <div className="variant">{firstItem?.variant || ""}</div>
                                    <div className="qty-price">
                                        <span>Qty {firstItem?.quantity || 0}</span>
                                        <span className="price">₹{firstItem?.price || 0}</span>
                                    </div>
                                    {remainingCount > 0 && (
                                        <span className="more-products-badge">
                                            +{remainingCount} more product
                                            {remainingCount > 1 ? "s" : ""}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Order Meta */}
                            <div className="order-meta-compact">
                                <div className="status-indicator">
                                    <span className={getStatusDot(order.status)}></span>
                                    {getStatusDisplay(order.status)}
                                </div>
                                <div className="delivery-date">
                                    <FiCalendar style={{ display: "inline", marginRight: "4px" }} />
                                    {order.expected_delivery || "Delivery pending"}
                                </div>
                                <div className="order-total">₹{order.total_price}</div>
                                <FiChevronRight className="arrow-icon" />
                            </div>
                        </div>
                    );
                })}

                {filteredOrders.length === 0 && (
                    <div className="orders-empty" style={{ padding: "40px 20px", minHeight: "auto" }}>
                        <p style={{ color: "#6e665e" }}>No orders match your filters.</p>
                        <button
                            onClick={() => {
                                setSearchTerm("");
                                setFilterStatus("All");
                            }}
                            style={{ marginTop: "16px", padding: "10px 32px", fontSize: "0.85rem" }}
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}

export default Orders;