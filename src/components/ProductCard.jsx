import { useEffect, useState, useCallback, useMemo } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import {
    FaHeart,
    FaRegHeart,
    FaStar,
    FaStarHalfAlt,
} from "react-icons/fa";
import "./ProductCard.css";

function ProductCard() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [wishlist, setWishlist] = useState([]);
    const [selectedImages, setSelectedImages] = useState({});

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await api.get("/accounts/home-page/");
            console.log("Response Data:", response.data);
            console.log("Products:", response.data.products);

            const data = response.data.products || [];
            setProducts(data);

            // Initialize selected images with first image or placeholder
            const initialImages = {};
            data.forEach((product) => {
                if (product.images && product.images.length > 0) {
                    initialImages[product.id] = product.images[0].image;
                } else if (product.image) {
                    initialImages[product.id] = product.image;
                } else {
                    initialImages[product.id] = "https://placehold.co/600x600";
                }
            });
            setSelectedImages(initialImages);

        } catch (err) {
            console.error("Error fetching products:", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleWishlist = useCallback((e, productId) => {
        e.stopPropagation();
        setWishlist(prev => 
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    }, []);

    const changeImage = useCallback((e, productId, imageUrl) => {
        e.stopPropagation();
        // Only update if the image is different
        setSelectedImages(prev => {
            if (prev[productId] === imageUrl) return prev;
            return {
                ...prev,
                [productId]: imageUrl
            };
        });
    }, []);

    const handleProductClick = useCallback((productId) => {
        navigate(`/product/${productId}`);
    }, [navigate]);

    const handleKeyDown = useCallback((e, productId) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            navigate(`/product/${productId}`);
        }
    }, [navigate]);

    const renderStars = useCallback((rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<FaStar key={`star-${i}`} />);
        }

        if (hasHalfStar) {
            stars.push(<FaStarHalfAlt key="half-star" />);
        }

        const emptyStars = 5 - stars.length;
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<FaStar key={`empty-${i}`} className="star-empty" />);
        }

        return stars;
    }, []);

    // Memoize product rendering to prevent unnecessary re-renders
    const renderProduct = useCallback((product) => {
        const hasDiscount = product.discount_price && 
            Number(product.discount_price) < Number(product.price);

        const currentPrice = product.discount_price || product.price;
        
        const discountPercentage = hasDiscount
            ? Math.round(
                ((Number(product.price) - Number(product.discount_price)) / 
                Number(product.price)) * 100
            )
            : 0;

        const savingsAmount = hasDiscount 
            ? Number(product.price) - Number(product.discount_price)
            : 0;

        const rating = product.rating || 4.8;
        const reviewCount = product.review_count || 126;
        const isNewProduct = !product.rating && !product.review_count;
        const productImage = selectedImages[product.id] || "https://placehold.co/600x600";

        return (
            <div
                className="product-card"
                key={product.id}
                onClick={() => handleProductClick(product.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => handleKeyDown(e, product.id)}
            >
                <div className="product-image-container">
                    {hasDiscount && (
                        <span className="discount-badge">
                            -{discountPercentage}%
                        </span>
                    )}

                    <button
                        className="wishlist-button"
                        onClick={(e) => toggleWishlist(e, product.id)}
                        aria-label={
                            wishlist.includes(product.id)
                                ? "Remove from wishlist"
                                : "Add to wishlist"
                        }
                    >
                        {wishlist.includes(product.id)
                            ? <FaHeart className="heart-active" />
                            : <FaRegHeart />}
                    </button>

                    <img
                        key={productImage}
                        src={productImage}
                        alt={product.productname || "Product"}
                        loading="lazy"
                        className="product-image"
                    />
                </div>

                {product.images && product.images.length > 1 && (
                    <div className="thumbnail-strip">
                        {product.images.slice(0, 4).map((img) => (
                            <img
                                key={img.id}
                                src={img.image}
                                alt={`${product.productname} view`}
                                className={
                                    selectedImages[product.id] === img.image
                                        ? "thumbnail-active"
                                        : ""
                                }
                                onMouseEnter={(e) => changeImage(e, product.id, img.image)}
                                onClick={(e) => changeImage(e, product.id, img.image)}
                                loading="lazy"
                            />
                        ))}
                    </div>
                )}

                <div className="product-info">
                    <h3 className="product-name">
                        {product.productname}
                    </h3>

                    <div className="rating-container">
                        <div className="stars-wrapper">
                            {isNewProduct ? (
                                <>
                                    {renderStars(5)}
                                    <span className="new-tag">New</span>
                                </>
                            ) : (
                                <>
                                    {renderStars(rating)}
                                    <span className="rating-value">
                                        {rating.toFixed(1)}
                                    </span>
                                    <span className="review-count">
                                        ({reviewCount})
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="price-container">
                        <span className="price-current">
                            ₹{Number(currentPrice).toLocaleString("en-IN")}
                        </span>
                        {hasDiscount && (
                            <>
                                <span className="price-original">
                                    ₹{Number(product.price).toLocaleString("en-IN")}
                                </span>
                                <span className="discount-save">
                                    Save ₹{savingsAmount.toLocaleString("en-IN")}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    }, [
        selectedImages, 
        wishlist, 
        toggleWishlist, 
        changeImage, 
        handleProductClick, 
        handleKeyDown, 
        renderStars
    ]);

    if (loading) {
        return (
            <div className="product-loader">
                <div className="loader-ring"></div>
            </div>
        );
    }

    return (
        <section className="product-section">
            <div className="product-grid">
                {products.map(renderProduct)}
            </div>
        </section>
    );
}

export default ProductCard;