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
    FiX,
    FiStar,
    FiTruck,
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
    const [searchQuery, setSearchQuery] = useState("");
    const [showSearch, setShowSearch] = useState(false);

    const dropdownRef = useRef(null);
    const mobileMenuRef = useRef(null);
    const searchInputRef = useRef(null);

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
                !event.target.closest('.mobile-menu-toggle')
            ) {
                closeMobileMenu();
            }

        };

        document.addEventListener("mousedown", handleClickOutside);

        return () =>
            document.removeEventListener("mousedown", handleClickOutside);

    }, [mobileMenu]);

    // -------------------------------
    // Escape Key Handler
    // -------------------------------

    useEffect(() => {

        const handleEscape = (event) => {

            if (event.key === "Escape") {

                if (mobileMenu) {
                    closeMobileMenu();
                }

                if (showDropdown) {
                    setShowDropdown(false);
                }

                if (showSearch) {
                    setShowSearch(false);
                }

            }

        };

        document.addEventListener("keydown", handleEscape);

        return () =>
            document.removeEventListener("keydown", handleEscape);

    }, [mobileMenu, showDropdown, showSearch]);

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
    // Search Focus
    // -------------------------------

    useEffect(() => {
        if (showSearch && searchInputRef.current) {
            setTimeout(() => searchInputRef.current.focus(), 100);
        }
    }, [showSearch]);

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

    const toggleSearch = () => {
        setShowSearch(!showSearch);
        if (!showSearch && searchInputRef.current) {
            setTimeout(() => searchInputRef.current.focus(), 100);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
            setShowSearch(false);
            setSearchQuery("");
            closeMobileMenu();
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
        setShowDropdown(false);
        closeMobileMenu();

        navigate("/login");

    };

    // -------------------------------
    // Check if path is active
    // -------------------------------

    const isActive = (path) => {
        if (path === "/" && location.pathname === "/") return true;
        if (path === "/shop" && location.pathname === "/shop") return true;
        return location.pathname === path;
    };

    // -------------------------------
    // Navigation Handler
    // -------------------------------

    const handleNavigation = (path) => {
        navigate(path);
        closeMobileMenu();
    };

    // -------------------------------
    // Bottom Navigation Items
    // -------------------------------

    const bottomNavItems = [
        { 
            icon: FiHome, 
            label: "Home", 
            path: "/",
            ariaLabel: "Go to Home"
        },
        { 
            icon: FiShoppingBag, 
            label: "Shop", 
            path: "/shop",
            ariaLabel: "Go to Shop"
        },
        { 
            icon: FiSearch, 
            label: "Search", 
            path: "/shop",
            ariaLabel: "Search products",
            isSearch: true
        },
        { 
            icon: FiShoppingCart, 
            label: "Cart", 
            path: "/cart",
            badge: cartCount > 0 ? (cartCount > 99 ? "99+" : cartCount) : null,
            ariaLabel: "Go to Cart",
            requiresAuth: true
        },
        { 
            icon: FiUser, 
            label: isLoggedIn ? "Profile" : "Login", 
            path: isLoggedIn ? "/profile" : "/login",
            ariaLabel: isLoggedIn ? "Go to Profile" : "Go to Login"
        },
    ];

    // -------------------------------
    // Bottom Nav Click Handler
    // -------------------------------

    const handleBottomNavClick = (item) => {

        if (item.requiresAuth && !isLoggedIn) {
            navigate("/login");
            return;
        }

        if (item.isSearch) {
            if (isLoggedIn) {
                navigate("/shop");
            } else {
                navigate("/login");
            }
            return;
        }

        navigate(item.path);

    };

    return (

        <>

            {/* ========================= */}
            {/* TOP HEADER BAR */}
            {/* ========================= */}

            <div className="top-header-bar">
                <div className="top-header-content">
                    <span>✨ Free Shipping on orders above ₹999</span>
                    <span className="top-header-divider">|</span>
                    <span>🛡️ 100% Secure Checkout</span>
                    <span className="top-header-divider">|</span>
                    <span>📦 Easy Returns</span>
                </div>
            </div>

            {/* ========================= */}
            {/* MAIN NAVBAR */}
            {/* ========================= */}

            <header className="navbar" role="banner">

                {/* ========================= */}
                {/* Logo */}
                {/* ========================= */}

                <div
                    className="logo"
                    onClick={() => handleNavigation("/")}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            handleNavigation("/");
                        }
                    }}
                    aria-label="ClayWare Home"
                >
                    <span className="logo-icon" aria-hidden="true">✦</span>
                    <span className="logo-text">CLAYWARE</span>
                </div>

                {/* ========================= */}
                {/* Desktop Navigation */}
                {/* ========================= */}

                <nav className="desktop-nav" aria-label="Main navigation">

                    <Link 
                        to="/" 
                        className={`nav-link ${isActive("/") ? "active-link" : ""}`}
                        aria-current={isActive("/") ? "page" : undefined}
                    >
                        Home
                    </Link>

                    <Link 
                        to="/shop" 
                        className={`nav-link ${isActive("/shop") ? "active-link" : ""}`}
                        aria-current={isActive("/shop") ? "page" : undefined}
                    >
                        Shop
                    </Link>

                    <Link 
                        to="/our-story" 
                        className={`nav-link ${isActive("/our-story") ? "active-link" : ""}`}
                        aria-current={isActive("/our-story") ? "page" : undefined}
                    >
                        Our Story
                    </Link>

                    <Link 
                        to="/sell" 
                        className={`nav-link ${isActive("/sell") ? "active-link" : ""}`}
                        aria-current={isActive("/sell") ? "page" : undefined}
                    >
                        Sell
                    </Link>

                </nav>

                {/* ========================= */}
                {/* Right Side Actions */}
                {/* ========================= */}

                <div className="nav-actions" role="toolbar" aria-label="User actions">

                    {/* Search - Desktop */}
                    <div className="search-wrapper desktop-only">
                        <form onSubmit={handleSearch} className="search-form" role="search">
                            <input
                                ref={searchInputRef}
                                type="search"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                                aria-label="Search for products"
                                aria-describedby="search-description"
                            />
                            <span id="search-description" className="sr-only">
                                Enter your search term and press Enter
                            </span>
                            <button 
                                type="submit" 
                                className="search-submit" 
                                aria-label="Submit search"
                            >
                                <FiSearch aria-hidden="true" />
                            </button>
                        </form>
                    </div>

                    {/* Search Toggle - Mobile */}
                    <button
                        className="search-toggle mobile-only"
                        onClick={toggleSearch}
                        aria-label="Toggle search"
                        aria-expanded={showSearch}
                    >
                        <FiSearch aria-hidden="true" />
                    </button>

                    {/* Cart */}
                    <div
                        className="cart-wrapper"
                        onClick={() => {
                            if (!isLoggedIn) {
                                navigate("/login");
                                return;
                            }
                            navigate("/cart");
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                if (!isLoggedIn) {
                                    navigate("/login");
                                    return;
                                }
                                navigate("/cart");
                            }
                        }}
                        aria-label={`Cart with ${cartCount} items`}
                    >

                        <FiShoppingBag className="nav-icon cart-icon" aria-hidden="true" />

                        {cartCount > 0 && (

                            <span className="cart-badge" aria-label={`${cartCount} items in cart`}>

                                {cartCount > 99
                                    ? "99+"
                                    : cartCount}

                            </span>

                        )}

                    </div>

                    {/* ========================= */}
                    {/* Login / Account */}
                    {/* ========================= */}

                    {!isLoggedIn ? (

                        <button
                            className="login-btn"
                            onClick={() => navigate("/login")}
                            aria-label="Login to your account"
                        >
                            <FiUser className="login-icon" aria-hidden="true" />
                            <span>Login</span>
                        </button>

                    ) : (

                        <div
                            className="account-menu"
                            ref={dropdownRef}
                        >

                            <button
                                className="account-btn"
                                onClick={toggleDropdown}
                                aria-expanded={showDropdown}
                                aria-haspopup="true"
                                aria-label="Account menu"
                            >

                                <div className="avatar-circle" aria-hidden="true">

                                    <FiUser />

                                </div>

                                <span>

                                    Account

                                </span>

                                <FiChevronDown
                                    className={
                                        showDropdown
                                            ? "rotate"
                                            : ""
                                    }
                                    aria-hidden="true"
                                />

                            </button>

                            {showDropdown && (

                                <div 
                                    className="account-dropdown"
                                    role="menu"
                                    aria-label="Account options"
                                >

                                    <div className="dropdown-header" role="presentation">

                                        <div className="profile-avatar" aria-hidden="true">

                                            <FiUser />

                                        </div>

                                        <div>

                                            <h4>Welcome Back</h4>

                                            <p>
                                                {
                                                    localStorage.getItem(
                                                        "email"
                                                    )
                                                }
                                            </p>

                                        </div>

                                    </div>

                                    <div className="dropdown-divider" role="separator"></div>

                                    <div
                                        className="dropdown-item"
                                        role="menuitem"
                                        tabIndex={0}
                                        onClick={() => {
                                            navigate("/profile");
                                            setShowDropdown(false);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                navigate("/profile");
                                                setShowDropdown(false);
                                            }
                                        }}
                                    >
                                        <FiUser aria-hidden="true" />
                                        <span>My Profile</span>
                                    </div>

                                    <div
                                        className="dropdown-item"
                                        role="menuitem"
                                        tabIndex={0}
                                        onClick={() => {
                                            navigate("/orders");
                                            setShowDropdown(false);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                navigate("/orders");
                                                setShowDropdown(false);
                                            }
                                        }}
                                    >
                                        <FiPackage aria-hidden="true" />
                                        <span>My Orders</span>
                                    </div>

                                    <div
                                        className="dropdown-item"
                                        role="menuitem"
                                        tabIndex={0}
                                        onClick={() => {
                                            navigate("/wishlist");
                                            setShowDropdown(false);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                navigate("/wishlist");
                                                setShowDropdown(false);
                                            }
                                        }}
                                    >
                                        <FiHeart aria-hidden="true" />
                                        <span>Wishlist</span>
                                    </div>

                                    <div
                                        className="dropdown-item"
                                        role="menuitem"
                                        tabIndex={0}
                                        onClick={() => {
                                            navigate("/addresses");
                                            setShowDropdown(false);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                navigate("/addresses");
                                                setShowDropdown(false);
                                            }
                                        }}
                                    >
                                        <FiMapPin aria-hidden="true" />
                                        <span>My Addresses</span>
                                    </div>

                                    <div
                                        className="dropdown-item"
                                        role="menuitem"
                                        tabIndex={0}
                                        onClick={() => {
                                            navigate("/settings");
                                            setShowDropdown(false);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                navigate("/settings");
                                                setShowDropdown(false);
                                            }
                                        }}
                                    >
                                        <FiSettings aria-hidden="true" />
                                        <span>Settings</span>
                                    </div>

                                    <div className="dropdown-divider" role="separator"></div>

                                    <div
                                        className="dropdown-item logout"
                                        role="menuitem"
                                        tabIndex={0}
                                        onClick={handleLogout}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                handleLogout();
                                            }
                                        }}
                                    >
                                        <FiLogOut aria-hidden="true" />
                                        <span>Logout</span>
                                    </div>

                                </div>

                            )}

                        </div>

                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        className="mobile-menu-toggle"
                        onClick={toggleMobileMenu}
                        aria-label="Toggle menu"
                        aria-expanded={mobileMenu}
                    >

                        <FiMenu aria-hidden="true" />

                    </button>

                </div>

            </header>

            {/* ========================= */}
            {/* MOBILE SEARCH OVERLAY */}
            {/* ========================= */}

            <div className={`mobile-search-overlay ${showSearch ? 'active' : ''}`} role="search">
                <form onSubmit={handleSearch} className="mobile-search-form">
                    <input
                        ref={searchInputRef}
                        type="search"
                        placeholder="Search for products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="mobile-search-input"
                        aria-label="Search for products"
                        autoFocus
                    />
                    <button type="submit" className="mobile-search-submit" aria-label="Submit search">
                        <FiSearch aria-hidden="true" />
                    </button>
                    <button
                        type="button"
                        className="mobile-search-close"
                        onClick={toggleSearch}
                        aria-label="Close search"
                    >
                        <FiX aria-hidden="true" />
                    </button>
                </form>
            </div>

            {/* ========================= */}
            {/* MOBILE SIDE MENU */}
            {/* ========================= */}

            <div 
                className={`mobile-menu-overlay ${mobileMenu ? 'active' : ''}`} 
                onClick={closeMobileMenu}
                aria-hidden="true"
            ></div>

            <nav 
                className={`mobile-nav ${mobileMenu ? 'active' : ''}`} 
                ref={mobileMenuRef}
                aria-label="Mobile navigation"
                role="dialog"
                aria-modal="true"
            >

                <div className="mobile-nav-header">
                    <div className="mobile-nav-logo">
                        <span className="logo-icon" aria-hidden="true">✦</span>
                        <span>CLAYWARE</span>
                    </div>
                    <button 
                        className="mobile-nav-close" 
                        onClick={closeMobileMenu}
                        aria-label="Close menu"
                    >
                        <FiX aria-hidden="true" />
                    </button>
                </div>

                {isLoggedIn && (
                    <div className="mobile-user-card">
                        <div className="mobile-user-avatar" aria-hidden="true">
                            <FiUser />
                        </div>
                        <div className="mobile-user-info">
                            <span className="mobile-user-name">Welcome</span>
                            <span className="mobile-user-email">
                                {localStorage.getItem("email") || "User"}
                            </span>
                        </div>
                    </div>
                )}

                <div className="mobile-nav-links">

                    <Link 
                        to="/" 
                        onClick={closeMobileMenu}
                        className={`mobile-nav-link ${isActive("/") ? "active-link" : ""}`}
                    >
                        <FiHome aria-hidden="true" />
                        <span>Home</span>
                    </Link>

                    <Link 
                        to="/shop" 
                        onClick={closeMobileMenu}
                        className={`mobile-nav-link ${isActive("/shop") ? "active-link" : ""}`}
                    >
                        <FiShoppingBag aria-hidden="true" />
                        <span>Shop</span>
                    </Link>

                    <Link 
                        to="/our-story" 
                        onClick={closeMobileMenu}
                        className={`mobile-nav-link ${isActive("/our-story") ? "active-link" : ""}`}
                    >
                        <FiStar aria-hidden="true" />
                        <span>Our Story</span>
                    </Link>

                    <Link 
                        to="/sell" 
                        onClick={closeMobileMenu}
                        className={`mobile-nav-link ${isActive("/sell") ? "active-link" : ""}`}
                    >
                        <FiTruck aria-hidden="true" />
                        <span>Sell</span>
                    </Link>

                    <div className="mobile-divider" role="separator"></div>

                    {isLoggedIn ? (
                        <>
                            <Link to="/profile" onClick={closeMobileMenu} className="mobile-nav-link">
                                <FiUser aria-hidden="true" />
                                <span>My Profile</span>
                            </Link>
                            <Link to="/orders" onClick={closeMobileMenu} className="mobile-nav-link">
                                <FiPackage aria-hidden="true" />
                                <span>My Orders</span>
                            </Link>
                            <Link to="/wishlist" onClick={closeMobileMenu} className="mobile-nav-link">
                                <FiHeart aria-hidden="true" />
                                <span>Wishlist</span>
                            </Link>
                            <Link to="/addresses" onClick={closeMobileMenu} className="mobile-nav-link">
                                <FiMapPin aria-hidden="true" />
                                <span>Addresses</span>
                            </Link>
                            <Link to="/settings" onClick={closeMobileMenu} className="mobile-nav-link">
                                <FiSettings aria-hidden="true" />
                                <span>Settings</span>
                            </Link>
                            <div className="mobile-divider" role="separator"></div>
                            <Link 
                                to="/login" 
                                onClick={handleLogout}
                                className="mobile-nav-link mobile-logout"
                            >
                                <FiLogOut aria-hidden="true" />
                                <span>Logout</span>
                            </Link>
                        </>
                    ) : (
                        <>
                            <div className="mobile-divider" role="separator"></div>
                            <Link 
                                to="/login" 
                                onClick={closeMobileMenu}
                                className="mobile-nav-link mobile-login-link"
                            >
                                <FiUser aria-hidden="true" />
                                <span>Login</span>
                            </Link>
                            <Link 
                                to="/signup" 
                                onClick={closeMobileMenu}
                                className="mobile-nav-link mobile-signup-link"
                            >
                                <span>Sign Up</span>
                            </Link>
                        </>
                    )}

                </div>

                <div className="mobile-nav-footer">
                    <span>© 2024 ClayWare</span>
                </div>

            </nav>

            {/* ========================= */}
            {/* MOBILE BOTTOM NAVIGATION */}
            {/* ========================= */}

            <nav className="bottom-nav" aria-label="Bottom navigation">

                {bottomNavItems.map((item) => {

                    const isActivePath = location.pathname === item.path;
                    const Icon = item.icon;

                    return (

                        <button
                            key={item.label}
                            className={`bottom-nav-item ${isActivePath ? "active" : ""}`}
                            onClick={() => handleBottomNavClick(item)}
                            aria-label={item.ariaLabel || item.label}
                            aria-current={isActivePath ? "page" : undefined}
                        >

                            <div className="bottom-nav-icon-wrapper">
                                <Icon aria-hidden="true" />
                                {item.badge && (
                                    <span className="bottom-cart-badge" aria-label={`${item.badge} items`}>
                                        {item.badge}
                                    </span>
                                )}
                            </div>

                            <span>{item.label}</span>

                            {isActivePath && (
                                <span className="bottom-nav-indicator" aria-hidden="true"></span>
                            )}

                        </button>

                    );

                })}

            </nav>

        </>

    );

}

export default Navbar;