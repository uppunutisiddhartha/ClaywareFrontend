import "./Navbar.css";

import {
    FiSearch,
    FiShoppingBag,
    FiMenu,
    FiUser,
    FiChevronDown,
    FiPackage,
    FiHeart,
    FiMapPin,
    FiSettings,
    FiLogOut,
} from "react-icons/fi";

import {
    Link,
    useNavigate,
} from "react-router-dom";

import {
    useState,
    useEffect,
    useRef,
} from "react";

import api from "../api/axios";

function Navbar() {

    const navigate = useNavigate();

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [mobileMenu, setMobileMenu] = useState(false);

    const dropdownRef = useRef();

    // -------------------------------
    // Login & Cart Check
    // -------------------------------

    useEffect(() => {

        const token = localStorage.getItem("token");

        setIsLoggedIn(!!token);

        if (token) {
            fetchCartCount();
        }

        const updateCart = () => {
            fetchCartCount();
        };

        window.addEventListener("cartUpdated", updateCart);

        return () => {
            window.removeEventListener("cartUpdated", updateCart);
        };

    }, []);

    // -------------------------------
    // Close Dropdown Outside Click
    // -------------------------------

    useEffect(() => {

        const handleClickOutside = (event) => {

            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setShowDropdown(false);
            }

        };

        document.addEventListener("mousedown", handleClickOutside);

        return () =>
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );

    }, []);

    // -------------------------------
    // Fetch Cart Count
    // -------------------------------
const fetchCartCount = async () => {

    const token = localStorage.getItem("token");

    if (!token) return;

    try {

        const response = await api.get("/user/viewcart/");

        setCartCount(response.data.total_items);

    } catch (error) {

        console.log(error);

        setCartCount(0);

    }

};

    // -------------------------------
    // Logout
    // -------------------------------

    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("email");

        setCartCount(0);
        setIsLoggedIn(false);

        navigate("/login");

    };

    return (

        <header className="navbar">

            {/* ========================= */}
            {/* Logo */}
            {/* ========================= */}

            <div
                className="logo"
                onClick={() => navigate("/")}
            >
                CLAYWARE
            </div>

            {/* ========================= */}
            {/* Navigation */}
            {/* ========================= */}

            <nav className={mobileMenu ? "active" : ""}>

                <Link to="/">HOME</Link>

                <Link to="/shop">SHOP</Link>

                <Link to="/our-story">OUR STORY</Link>

                <Link to="/sell">SELL</Link>

            </nav>

            {/* ========================= */}
            {/* Right Side */}
            {/* ========================= */}

            <div className="nav-actions">

                {/* Search */}

                <FiSearch
                    className="nav-icon"
                    onClick={() => navigate("/shop")}
                />

                {/* Cart */}

                <div
                    className="cart-wrapper"
                    onClick={() => navigate("/cart")}
                >

                    <FiShoppingBag
                        className="nav-icon cart-icon"
                    />

                    {cartCount > 0 && (

                        <span className="cart-badge">

                            {cartCount > 99
                                ? "99+"
                                : cartCount}

                        </span>

                    )}

                </div>

                {/* ========================= */}
                {/* Login */}
                {/* ========================= */}

                {!isLoggedIn ? (

                    <button
                        className="login-btn"
                        onClick={() => navigate("/login")}
                    >
                        LOGIN
                    </button>

                ) : (

                    <div
                        className="account-menu"
                        ref={dropdownRef}
                    >

                        {/* Button */}

                        <button
                            className="account-btn"
                            onClick={() =>
                                setShowDropdown(!showDropdown)
                            }
                        >

                            <div className="avatar-circle">

                                <FiUser />

                            </div>

                            <span>

                                My Account

                            </span>

                            <FiChevronDown
                                className={
                                    showDropdown
                                        ? "rotate"
                                        : ""
                                }
                            />

                        </button>

                        {/* Dropdown */}

                        {showDropdown && (

                            <div className="account-dropdown">

                                {/* Header */}

                                <div className="dropdown-header">

                                    <div className="profile-avatar">

                                        <FiUser />

                                    </div>

                                    <div>

                                        <h4>

                                            Welcome

                                        </h4>

                                        <p>

                                            {
                                                localStorage.getItem(
                                                    "email"
                                                )
                                            }

                                        </p>

                                    </div>

                                </div>

                                <div className="dropdown-divider"></div>

                                {/* Profile */}

                                <div
                                    className="dropdown-item"
                                    onClick={() =>
                                        navigate("/profile")
                                    }
                                >

                                    <FiUser />

                                    <span>

                                        My Profile

                                    </span>

                                </div>

                                {/* Orders */}

                                <div
                                    className="dropdown-item"
                                    onClick={() =>
                                        navigate("/orders")
                                    }
                                >

                                    <FiPackage />

                                    <span>

                                        My Orders

                                    </span>

                                </div>

                                {/* Wishlist */}

                                <div
                                    className="dropdown-item"
                                    onClick={() =>
                                        navigate("/wishlist")
                                    }
                                >

                                    <FiHeart />

                                    <span>

                                        Wishlist

                                    </span>

                                </div>

                                {/* Address */}

                                <div
                                    className="dropdown-item"
                                    onClick={() =>
                                        navigate("/addresses")
                                    }
                                >

                                    <FiMapPin />

                                    <span>

                                        My Addresses

                                    </span>

                                </div>

                                {/* Settings */}

                                <div
                                    className="dropdown-item"
                                    onClick={() =>
                                        navigate("/settings")
                                    }
                                >

                                    <FiSettings />

                                    <span>

                                        Settings

                                    </span>

                                </div>

                                <div className="dropdown-divider"></div>

                                {/* Logout */}

                                <div
                                    className="dropdown-item logout"
                                    onClick={handleLogout}
                                >

                                    <FiLogOut />

                                    <span>

                                        Logout

                                    </span>

                                </div>

                            </div>

                        )}

                    </div>

                )}

                {/* Mobile Menu */}

                <FiMenu
                    className="mobile-menu"
                    onClick={() =>
                        setMobileMenu(!mobileMenu)
                    }
                />

            </div>

        </header>

    );

}

export default Navbar;