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
    FiHome,
    FiShoppingCart,
} from "react-icons/fi";

import {
    Link,
    useNavigate,
    useLocation,
} from "react-router-dom";

import {
    useState,
    useEffect,
    useRef,
    useCallback,
} from "react";

import api from "../api/axios";

function Navbar() {

    const navigate = useNavigate();
    const location = useLocation();

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [mobileMenu, setMobileMenu] = useState(false);

    const dropdownRef = useRef();
    const mobileMenuRef = useRef();

    // -------------------------------
    // Login & Cart Check
    // -------------------------------

    const fetchCartCount = useCallback(async () => {

        const token = localStorage.getItem("token");

        if (!token) return;

        try {

            const response = await api.get("/user/viewcart/");

            setCartCount(response.data.total_items);

        } catch (error) {

            console.log(error);

            setCartCount(0);

        }

    }, []);

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

    }, [fetchCartCount]);

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
    // Close Mobile Menu Outside Click
    // -------------------------------

    useEffect(() => {

        const handleClickOutside = (event) => {

            if (
                mobileMenu &&
                mobileMenuRef.current &&
                !mobileMenuRef.current.contains(event.target) &&
                !event.target.closest('.mobile-menu')
            ) {
                closeMobileMenu();
            }

        };

        document.addEventListener("mousedown", handleClickOutside);

        return () =>
            document.removeEventListener("mousedown", handleClickOutside);

    }, [mobileMenu]);

    // -------------------------------
    // Body Scroll Lock
    // -------------------------------

    useEffect(() => {

        if (mobileMenu) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };

    }, [mobileMenu]);

    // -------------------------------
    // Close Mobile Menu on Route Change
    // -------------------------------

    useEffect(() => {

        closeMobileMenu();

    }, [location]);

    // -------------------------------
    // Toggle Functions
    // -------------------------------

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    const toggleMobileMenu = () => {
        setMobileMenu(!mobileMenu);
    };

    const closeMobileMenu = () => {
        setMobileMenu(false);
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
        setShowDropdown(false);
        closeMobileMenu();

        navigate("/login");

    };

    // -------------------------------
    // Navigation Handler
    // -------------------------------

    const handleNavClick = (path) => {
        navigate(path);
        closeMobileMenu();
    };

    // -------------------------------
    // Check if path is active
    // -------------------------------

    const isActive = (path) => {
        return location.pathname === path;
    };

    // -------------------------------
    // Bottom Navigation Items
    // -------------------------------

    const bottomNavItems = [
        { icon: FiHome, label: "Home", path: "/" },
        { icon: FiShoppingBag, label: "Shop", path: "/shop" },
        { icon: FiSearch, label: "Search", path: "/shop" },
        { 
            icon: FiShoppingCart, 
            label: "Cart", 
            path: "/cart",
            badge: cartCount > 0 ? (cartCount > 99 ? "99+" : cartCount) : null
        },
        { 
            icon: FiUser, 
            label: isLoggedIn ? "Me" : "Login", 
            path: isLoggedIn ? "/profile" : "/login"
        },
    ];

    return (

        <>

            {/* ========================= */}
            {/* MAIN NAVBAR */}
            {/* ========================= */}

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
                {/* Desktop Navigation */}
                {/* ========================= */}

                <nav className="desktop-nav">

                    <Link 
                        to="/" 
                        className={isActive("/") ? "active-link" : ""}
                    >
                        HOME
                    </Link>

                    <Link 
                        to="/shop" 
                        className={isActive("/shop") ? "active-link" : ""}
                    >
                        SHOP
                    </Link>

                    <Link 
                        to="/our-story" 
                        className={isActive("/our-story") ? "active-link" : ""}
                    >
                        OUR STORY
                    </Link>

                    <Link 
                        to="/sell" 
                        className={isActive("/sell") ? "active-link" : ""}
                    >
                        SELL
                    </Link>

                </nav>

                {/* ========================= */}
                {/* Right Side Actions */}
                {/* ========================= */}

                <div className="nav-actions">

                    {/* Search - Desktop Only */}
                    <FiSearch
                        className="nav-icon desktop-only"
                        onClick={() => navigate("/shop")}
                    />

                    {/* Cart - Desktop Only */}
                    <div
                        className="cart-wrapper desktop-only"
                        onClick={() => navigate("/cart")}
                    >

                        <FiShoppingBag className="nav-icon cart-icon" />

                        {cartCount > 0 && (

                            <span className="cart-badge">

                                {cartCount > 99
                                    ? "99+"
                                    : cartCount}

                            </span>

                        )}

                    </div>

                    {/* ========================= */}
                    {/* Login / Account - Desktop Only */}
                    {/* ========================= */}

                    {!isLoggedIn ? (

                        <button
                            className="login-btn desktop-only"
                            onClick={() => navigate("/login")}
                        >
                            LOGIN
                        </button>

                    ) : (

                        <div
                            className="account-menu desktop-only"
                            ref={dropdownRef}
                        >

                            <button
                                className="account-btn"
                                onClick={toggleDropdown}
                                aria-expanded={showDropdown}
                                aria-haspopup="true"
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

                            {showDropdown && (

                                <div className="account-dropdown">

                                    <div className="dropdown-header">

                                        <div className="profile-avatar">

                                            <FiUser />

                                        </div>

                                        <div>

                                            <h4>Welcome</h4>

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

                                    <div
                                        className="dropdown-item"
                                        onClick={() => {
                                            navigate("/profile");
                                            setShowDropdown(false);
                                        }}
                                    >
                                        <FiUser />
                                        <span>My Profile</span>
                                    </div>

                                    <div
                                        className="dropdown-item"
                                        onClick={() => {
                                            navigate("/orders");
                                            setShowDropdown(false);
                                        }}
                                    >
                                        <FiPackage />
                                        <span>My Orders</span>
                                    </div>

                                    <div
                                        className="dropdown-item"
                                        onClick={() => {
                                            navigate("/wishlist");
                                            setShowDropdown(false);
                                        }}
                                    >
                                        <FiHeart />
                                        <span>Wishlist</span>
                                    </div>

                                    <div
                                        className="dropdown-item"
                                        onClick={() => {
                                            navigate("/addresses");
                                            setShowDropdown(false);
                                        }}
                                    >
                                        <FiMapPin />
                                        <span>My Addresses</span>
                                    </div>

                                    <div
                                        className="dropdown-item"
                                        onClick={() => {
                                            navigate("/settings");
                                            setShowDropdown(false);
                                        }}
                                    >
                                        <FiSettings />
                                        <span>Settings</span>
                                    </div>

                                    <div className="dropdown-divider"></div>

                                    <div
                                        className="dropdown-item logout"
                                        onClick={handleLogout}
                                    >
                                        <FiLogOut />
                                        <span>Logout</span>
                                    </div>

                                </div>

                            )}

                        </div>

                    )}

                    {/* Mobile Menu Toggle */}
                    <FiMenu
                        className="mobile-menu"
                        onClick={toggleMobileMenu}
                        aria-label="Toggle menu"
                    />

                </div>

            </header>

            {/* ========================= */}
            {/* MOBILE SIDE MENU */}
            {/* ========================= */}

            <div className={`mobile-menu-overlay ${mobileMenu ? 'active' : ''}`} onClick={closeMobileMenu}></div>

            <nav className={`mobile-nav ${mobileMenu ? 'active' : ''}`} ref={mobileMenuRef}>

                <div className="mobile-nav-header">
                    <div className="mobile-nav-logo">CLAYWARE</div>
                    <button className="mobile-nav-close" onClick={closeMobileMenu}>✕</button>
                </div>

                <div className="mobile-nav-links">

                    <Link 
                        to="/" 
                        onClick={closeMobileMenu}
                        className={isActive("/") ? "active-link" : ""}
                    >
                        HOME
                    </Link>

                    <Link 
                        to="/shop" 
                        onClick={closeMobileMenu}
                        className={isActive("/shop") ? "active-link" : ""}
                    >
                        SHOP
                    </Link>

                    <Link 
                        to="/our-story" 
                        onClick={closeMobileMenu}
                        className={isActive("/our-story") ? "active-link" : ""}
                    >
                        OUR STORY
                    </Link>

                    <Link 
                        to="/sell" 
                        onClick={closeMobileMenu}
                        className={isActive("/sell") ? "active-link" : ""}
                    >
                        SELL
                    </Link>

                    <div className="mobile-divider"></div>

                    {isLoggedIn ? (
                        <>
                            <Link to="/profile" onClick={closeMobileMenu}>
                                MY PROFILE
                            </Link>
                            <Link to="/orders" onClick={closeMobileMenu}>
                                MY ORDERS
                            </Link>
                            <Link to="/wishlist" onClick={closeMobileMenu}>
                                WISHLIST
                            </Link>
                            <Link to="/addresses" onClick={closeMobileMenu}>
                                ADDRESSES
                            </Link>
                            <Link to="/settings" onClick={closeMobileMenu}>
                                SETTINGS
                            </Link>
                            <div className="mobile-divider"></div>
                            <Link 
                                to="/login" 
                                onClick={handleLogout}
                                className="mobile-logout"
                            >
                                LOGOUT
                            </Link>
                        </>
                    ) : (
                        <>
                            <div className="mobile-divider"></div>
                            <Link 
                                to="/login" 
                                onClick={closeMobileMenu}
                                className="mobile-login-link"
                            >
                                LOGIN
                            </Link>
                        </>
                    )}

                </div>

            </nav>

            {/* ========================= */}
            {/* MOBILE BOTTOM NAVIGATION */}
            {/* ========================= */}

            <nav className="bottom-nav">

                {bottomNavItems.map((item) => {

                    const isActivePath = location.pathname === item.path;
                    const Icon = item.icon;

                    return (

                        <button
                            key={item.label}
                            className={`bottom-nav-item ${isActivePath ? "active" : ""}`}
                            onClick={() => {
                                if (item.path === "/cart" && !isLoggedIn) {
                                    navigate("/login");
                                    return;
                                }
                                navigate(item.path);
                            }}
                            aria-label={item.label}
                        >

                            <div className="bottom-nav-icon-wrapper">
                                <Icon />
                                {item.badge && (
                                    <span className="bottom-cart-badge">{item.badge}</span>
                                )}
                            </div>

                            <span>{item.label}</span>

                        </button>

                    );

                })}

            </nav>

        </>

    );

}

export default Navbar;