import { useEffect, useState, useMemo } from "react";
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
    FiFilter,
    FiX,
    FiArrowUp,
    FiArrowDown,
    FiTruck,
    FiCheckCircle,
    FiClock as FiClock2,
    FiAlertCircle,
    FiBox,
    FiStar,
    FiHeart,
} from "react-icons/fi";

// ============================================
// SUBCOMPONENTS
// ============================================

// ---- Loading Skeleton ----
const OrdersSkeleton = () => (
    <div className="orders-page">
        <div className="orders-container">
            <div className="orders-skeleton-header">
                <div className="skeleton-line" style={{ width: "200px", height: "36px" }} />
                <div className="skeleton-line" style={{ width: "400px", height: "48px" }} />
            </div>
            <div className="orders-skeleton-filters">
                <div className="skeleton-line" style={{ width: "300px", height: "44px" }} />
                <div className="skeleton-line" style={{ width: "200px", height: "44px" }} />
            </div>
            <div className="orders-skeleton-list">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="skeleton-order-card">
                        <div className="skeleton-thumb" />
                        <div className="skeleton-content">
                            <div className="skeleton-line" style={{ width: "60%" }} />
                            <div className="skeleton-line" style={{ width: "40%" }} />
                            <div className="skeleton-line" style={{ width: "30%" }} />
                        </div>
                        <div className="skeleton-meta">
                            <div className="skeleton-line" style={{ width: "80px" }} />
                            <div className="skeleton-line" style={{ width: "60px" }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// ---- Empty State ----
const EmptyState = ({ onShop }) => (
    <div className="orders-empty-state">
        <div className="empty-icon">
            <FiShoppingBag />
        </div>
        <h2>No Orders Yet</h2>
        <p>Start exploring our beautiful handcrafted clay products</p>
        <button onClick={onShop} className="btn-primary">
            Start Shopping
        </button>
    </div>
);

// ---- No Results ----
const NoResults = ({ onClearFilters }) => (
    <div className="orders-no-results">
        <FiSearch size={48} />
        <h3>No orders found</h3>
        <p>Try adjusting your filters or search term</p>
        <button onClick={onClearFilters} className="btn-outline">
            Clear All Filters
        </button>
    </div>
);

// ---- Status Badge ----
const StatusBadge = ({ status }) => {
    const configs = {
        DELIVERED: { label: "Delivered", icon: FiCheckCircle, class: "delivered" },
        OUT_FOR_DELIVERY: { label: "Out for Delivery", icon: FiTruck, class: "shipping" },
        PACKED: { label: "Packed", icon: FiBox, class: "packed" },
        PLACED: { label: "Placed", icon: FiClock2, class: "placed" },
        CANCELLED: { label: "Cancelled", icon: FiX, class: "cancelled" },
    };
    const config = configs[status] || { label: status, icon: FiAlertCircle, class: "" };
    const Icon = config.icon;

    return (
        <span className={`status-badge ${config.class}`}>
            <Icon size={12} />
            {config.label}
        </span>
    );
};

// ============================================
// MAIN COMPONENT
// ============================================
function Orders() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [sortBy, setSortBy] = useState("newest");
    const [showFilters, setShowFilters] = useState(false);

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

    // ---- Helper Functions ----
    const getStatusDisplay = (status) => status.replaceAll("_", " ");

    // ---- Stats ----
    const stats = useMemo(() => {
        const total = orders.length;
        const delivered = orders.filter((o) => o.status === "DELIVERED").length;
        const processing = orders.filter(
            (o) => o.status === "PLACED" || o.status === "PACKED" || o.status === "OUT_FOR_DELIVERY"
        ).length;
        const cancelled = orders.filter((o) => o.status === "CANCELLED").length;
        return { total, delivered, processing, cancelled };
    }, [orders]);

    // ---- Filter & Sort ----
    const filteredOrders = useMemo(() => {
        let result = [...orders];

        // Filter by status
        if (filterStatus !== "All") {
            result = result.filter((o) => o.status === filterStatus);
        }

        // Filter by search
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(
                (o) =>
                    o.order_id.toString().includes(term) ||
                    o.items.some((item) => item.product_name.toLowerCase().includes(term))
            );
        }

        // Sort
        switch (sortBy) {
            case "newest":
                result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
            case "oldest":
                result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                break;
            case "price-high":
                result.sort((a, b) => Number(b.total_price) - Number(a.total_price));
                break;
            case "price-low":
                result.sort((a, b) => Number(a.total_price) - Number(b.total_price));
                break;
            default:
                break;
        }

        return result;
    }, [orders, filterStatus, searchTerm, sortBy]);

    const handleOrderClick = (orderId) => {
        navigate(`/orders/${orderId}`);
    };

    const clearFilters = () => {
        setSearchTerm("");
        setFilterStatus("All");
        setSortBy("newest");
    };

    const handleShop = () => navigate("/shop");

    if (loading) return <OrdersSkeleton />;
    if (orders.length === 0) return <EmptyState onShop={handleShop} />;

    return (
        <div className="orders-page">
            <Navbar />

            <div className="orders-container">
                {/* ===== HEADER ===== */}
                <header className="orders-header">
                    <div className="orders-header-left">
                        <h1>
                            <FiPackage />
                            My Orders
                        </h1>
                        <span className="orders-count">
                            {filteredOrders.length} {filteredOrders.length === 1 ? "order" : "orders"}
                            {filteredOrders.length !== orders.length && (
                                <span className="orders-total"> of {orders.length}</span>
                            )}
                        </span>
                    </div>

                    <div className="orders-stats">
                        <div className="stat-item">
                            <span className="stat-label">Total</span>
                            <span className="stat-value">{stats.total}</span>
                        </div>
                        <div className="stat-item delivered">
                            <span className="stat-label">Delivered</span>
                            <span className="stat-value">{stats.delivered}</span>
                        </div>
                        <div className="stat-item processing">
                            <span className="stat-label">Processing</span>
                            <span className="stat-value">{stats.processing}</span>
                        </div>
                        <div className="stat-item cancelled">
                            <span className="stat-label">Cancelled</span>
                            <span className="stat-value">{stats.cancelled}</span>
                        </div>
                    </div>
                </header>

                {/* ===== FILTERS ===== */}
                <div className="orders-filters">
                    <div className="filters-top">
                        <div className="search-box">
                            <FiSearch />
                            <input
                                type="text"
                                placeholder="Search orders by ID or product..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                aria-label="Search orders"
                            />
                            {searchTerm && (
                                <button
                                    className="search-clear"
                                    onClick={() => setSearchTerm("")}
                                    aria-label="Clear search"
                                >
                                    <FiX size={16} />
                                </button>
                            )}
                        </div>

                        <button
                            className="filter-toggle"
                            onClick={() => setShowFilters(!showFilters)}
                            aria-expanded={showFilters}
                        >
                            <FiFilter size={18} />
                            <span>Filters</span>
                            <span className="filter-count">
                                {filterStatus !== "All" ? 1 : 0}
                            </span>
                        </button>
                    </div>

                    <div className={`filters-bottom ${showFilters ? "expanded" : ""}`}>
                        <div className="filter-group">
                            <span className="filter-label">Status</span>
                            <div className="filter-chips">
                                {["All", "PLACED", "PACKED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"].map(
                                    (status) => (
                                        <button
                                            key={status}
                                            className={`filter-chip ${filterStatus === status ? "active" : ""}`}
                                            onClick={() => setFilterStatus(status)}
                                            aria-label={`Filter by ${status}`}
                                        >
                                            {status === "All" ? "All" : getStatusDisplay(status)}
                                        </button>
                                    )
                                )}
                            </div>
                        </div>

                        <div className="filter-group sort-group">
                            <span className="filter-label">Sort by</span>
                            <select
                                className="sort-select"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                aria-label="Sort orders"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="price-low">Price: Low to High</option>
                            </select>
                        </div>

                        {(searchTerm || filterStatus !== "All") && (
                            <button className="clear-filters" onClick={clearFilters}>
                                <FiX size={14} />
                                Clear Filters
                            </button>
                        )}
                    </div>
                </div>

                {/* ===== ORDERS LIST ===== */}
                <div className="orders-list">
                    {filteredOrders.map((order) => {
                        const firstItem = order.items[0];
                        const remainingCount = order.items.length - 1;
                        const isDelivered = order.status === "DELIVERED";

                        return (
                            <div
                                key={order.order_id}
                                className="order-card"
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
                                <div className="order-card-left">
                                    <div className="order-thumb">
                                        {firstItem?.image ? (
                                            <img src={firstItem.image} alt={firstItem.product_name} />
                                        ) : (
                                            <FiPackage />
                                        )}
                                    </div>

                                    <div className="order-info">
                                        <div className="order-info-top">
                                            <h3 className="order-product-name">
                                                {firstItem?.product_name || "Product"}
                                            </h3>
                                            <StatusBadge status={order.status} />
                                        </div>
                                        <div className="order-details">
                                            <span className="order-variant">
                                                {firstItem?.variant || ""}
                                            </span>
                                            <span className="order-separator">•</span>
                                            <span className="order-quantity">
                                                Qty: {firstItem?.quantity || 0}
                                            </span>
                                            <span className="order-separator">•</span>
                                            <span className="order-price">
                                                ₹{firstItem?.price || 0}
                                            </span>
                                        </div>
                                        {remainingCount > 0 && (
                                            <span className="order-more">
                                                +{remainingCount} more {remainingCount === 1 ? "item" : "items"}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="order-card-right">
                                    <div className="order-meta">
                                        <div className="order-id">
                                            <span className="meta-label">Order #</span>
                                            <span className="meta-value">{order.order_id}</span>
                                        </div>
                                        <div className="order-date">
                                            <FiCalendar size={14} />
                                            {new Date(order.created_at).toLocaleDateString("en-IN", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </div>
                                        <div className="order-total">
                                            <span className="meta-label">Total</span>
                                            <span className="meta-value">₹{order.total_price}</span>
                                        </div>
                                    </div>
                                    <FiChevronRight className="order-arrow" />
                                </div>
                            </div>
                        );
                    })}

                    {filteredOrders.length === 0 && (
                        <NoResults onClearFilters={clearFilters} />
                    )}
                </div>

                {/* ===== RECOMMENDED ===== */}
                <section className="orders-recommended">
                    <h2 className="recommended-title">
                        <FiHeart />
                        You might also like
                    </h2>
                    <div className="recommended-grid">
                        <div className="recommended-item">
                            <div className="recommended-image" />
                            <h4>Terracotta Water Bottle</h4>
                            <div className="recommended-price">₹699</div>
                            <button className="btn-sm btn-primary">View</button>
                        </div>
                        <div className="recommended-item">
                            <div className="recommended-image" />
                            <h4>Clay Incense Holder</h4>
                            <div className="recommended-price">₹299</div>
                            <button className="btn-sm btn-primary">View</button>
                        </div>
                        <div className="recommended-item">
                            <div className="recommended-image" />
                            <h4>Handmade Clay Bowl</h4>
                            <div className="recommended-price">₹499</div>
                            <button className="btn-sm btn-primary">View</button>
                        </div>
                    </div>
                </section>
            </div>

            <Footer />
        </div>
    );
}

export default Orders;