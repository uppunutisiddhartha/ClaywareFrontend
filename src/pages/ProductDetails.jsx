import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import WhyChooseUs from "../components/WhyChooseUs";

import api from "../api/axios";

import "./styles/ProductDetails.css";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedImage, setSelectedImage] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const [zoomStyle, setZoomStyle] = useState({});
  const [isZooming, setIsZooming] = useState(false);

  const [addingToCart, setAddingToCart] = useState(false);

  // Review states
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewImages, setReviewImages] = useState([]);
  const [reviewImagesPreview, setReviewImagesPreview] = useState([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Related products
  const [relatedProducts, setRelatedProducts] = useState([]);

  // =====================================
  // MOBILE SCROLL BEHAVIOR
  // =====================================
  
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [scrollState, setScrollState] = useState({
    showBottomNav: true,
    showStickyBar: false,
    showCompactHeader: false,
  });

  const productRef = useRef(null);
  const heroRef = useRef(null);
  const scrollTimeout = useRef(null);

  // Check if mobile on resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll handler with throttling
  useEffect(() => {
    if (!isMobile) return;

    const handleScroll = () => {
      if (scrollTimeout.current) return;

      scrollTimeout.current = setTimeout(() => {
        const scrollY = window.scrollY;
        const heroHeight = heroRef.current?.offsetHeight || 400;
        
        // Thresholds
        const stickyBarThreshold = Math.min(heroHeight * 0.3, 220);
        const compactHeaderThreshold = Math.min(heroHeight * 0.5, 320);

        // Calculate new states
        const shouldShowStickyBar = scrollY > stickyBarThreshold;
        const shouldShowCompactHeader = scrollY > compactHeaderThreshold;
        const shouldShowBottomNav = !shouldShowStickyBar;

        setScrollState({
          showBottomNav: shouldShowBottomNav,
          showStickyBar: shouldShowStickyBar,
          showCompactHeader: shouldShowCompactHeader,
        });

        scrollTimeout.current = null;
      }, 100); // Throttle to 100ms
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [isMobile]);

  // =====================================
  // FETCH PRODUCT
  // =====================================

  useEffect(() => {
    let cancelled = false;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get(`accounts/product/${id}/`);

        if (cancelled) return;

        const data = res.data;
        setProduct(data);

        const imgs = data.product_images?.map((img) => img.image) || data.images || [];
        if (imgs.length > 0) {
          setSelectedImage(imgs[0]);
        }

        if (data.variants && data.variants.length > 0) {
          const availableVariant = data.variants.find((v) => Number(v.stock_quantity) > 0) || data.variants[0];
          setSelectedVariant({
            ...availableVariant,
            isBase: false,
          });
        } else {
          setSelectedVariant({
            id: null,
            capacity: "Standard",
            price: data.price,
            discount_price: data.discount_price,
            stock_quantity: data.stock_quantity,
            isBase: true,
          });
        }

        // Fetch reviews
        fetchReviews(id);
        // Fetch related products
        fetchRelatedProducts(data.category?.id || data.category);

      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError("We couldn't load this product. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // =====================================
  // FETCH REVIEWS
  // =====================================

  const fetchReviews = async (productId) => {
    try {
      setReviewsLoading(true);
      const res = await api.get(`/order/products/${productId}/reviews/`)
      setReviews(res.data);
      
      // Check if user can review
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const canRes = await api.get(`/products/${productId}/can-review/`);
          setCanReview(canRes.data.can_review);
        } catch (err) {
          console.error("Error checking review permission:", err);
        }
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setReviewsLoading(false);
    }
  };

  // =====================================
  // FETCH RELATED PRODUCTS
  // =====================================

  const fetchRelatedProducts = async (categoryId) => {
    try {
      if (!categoryId) return;
      const res = await api.get(`/products/?category=${categoryId}&exclude=${id}&limit=6`);
      setRelatedProducts(res.data.results || res.data || []);
    } catch (err) {
      console.error("Error fetching related products:", err);
    }
  };

  // =====================================
  // PRODUCT IMAGES
  // =====================================

  const images = product?.product_images?.map((img) => img.image) || product?.images || [];

  // =====================================
  // STANDARD + VARIANTS
  // =====================================

  const allVariants = product
    ? [
        {
          id: null,
          capacity: "Standard",
          price: product.price,
          discount_price: product.discount_price,
          stock_quantity: product.stock_quantity,
          isBase: true,
        },
        ...(product.variants || []).map((variant) => ({
          ...variant,
          isBase: false,
        })),
      ]
    : [];

  // =====================================
  // PRICE
  // =====================================

  const mrp = Number(selectedVariant?.price || 0);
  const sellingPrice = selectedVariant?.discount_price && Number(selectedVariant.discount_price) < mrp
    ? Number(selectedVariant.discount_price)
    : mrp;
  const discount = mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;

  // =====================================
  // STOCK STATUS - IMPROVED LOGIC
  // =====================================

  const stock = Number(selectedVariant?.stock_quantity || 0);
  const inStock = stock > 0;

  // Stock status types with professional UI
  const getStockStatus = (stockCount) => {
    if (stockCount === 0) {
      return {
        type: 'out-of-stock',
        label: 'Out of Stock',
        message: 'Currently unavailable',
        action: 'Notify me when available',
        color: '#D32F2F',
        icon: '❌',
        dotColor: '#BDBDBD',
        bgColor: '#F5F5F5'
      };
    } else if (stockCount > 10) {
      return {
        type: 'plenty',
        label: '✅ In Stock',
        message: 'Ready to ship',
        action: null,
        color: '#2E7D32',
        icon: '✅',
        dotColor: '#4CAF50',
        bgColor: '#E8F5E9'
      };
    } else if (stockCount >= 5 && stockCount <= 10) {
      return {
        type: 'limited',
        label: '⚠️ Only Few Left',
        message: 'Hurry! Selling Fast',
        action: null,
        color: '#F57C00',
        icon: '⚠️',
        dotColor: '#FF9800',
        bgColor: '#FFF3E0'
      };
    } else if (stockCount >= 1 && stockCount <= 4) {
      return {
        type: 'very-low',
        label: `🔥 Only ${stockCount} left in stock`,
        message: 'Order soon!',
        action: null,
        color: '#D32F2F',
        icon: '🔥',
        dotColor: '#F44336',
        bgColor: '#FFEBEE'
      };
    }
    return null;
  };

  const stockStatus = getStockStatus(stock);
  const isOutOfStock = stock === 0;

  // =====================================
  // IMAGE ZOOM
  // =====================================

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: "scale(2.5)",
    });
  };

  const handleMouseEnter = () => setIsZooming(true);
  const resetZoom = () => {
    setIsZooming(false);
    setZoomStyle({ transform: "scale(1)" });
  };

  // =====================================
  // QUANTITY
  // =====================================

  const decreaseQty = () => setQuantity((prev) => Math.max(1, prev - 1));
  const increaseQty = () => {
    if (quantity < stock) setQuantity((prev) => prev + 1);
  };

  useEffect(() => {
    setQuantity(1);
  }, [selectedVariant]);

  // =====================================
  // ADD TO CART
  // =====================================

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first.");
      navigate("/login");
      return;
    }

    try {
      setAddingToCart(true);
      const response = await api.post(`/user/addtocart/${product.id}/`, {
        quantity,
        variant_id: selectedVariant?.isBase ? null : selectedVariant.id,
      });
      alert(response.data.message);
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Unable to add product to cart.");
    } finally {
      setAddingToCart(false);
    }
  };

  // =====================================
  // BUY NOW
  // =====================================

  const handleBuyNow = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first.");
      navigate("/login");
      return;
    }
    navigate("/checkout", {
      state: {
        buyNow: true,
        product_id: product.id,
        variant_id: selectedVariant?.isBase ? null : selectedVariant.id,
        quantity,
      },
    });
  };

  // =====================================
  // VARIANT CHANGE
  // =====================================

  const handleVariantChange = (variant) => {
    setSelectedVariant(variant);
    setQuantity(1);
    if (variant.image) setSelectedImage(variant.image);
  };

  // =====================================
  // REVIEW HANDLERS
  // =====================================

  const handleReviewImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const remaining = 5 - reviewImages.length;
    const validFiles = files.slice(0, remaining);
    
    setReviewImages((prev) => [...prev, ...validFiles]);
    setReviewImagesPreview((prev) => [
      ...prev,
      ...validFiles.map((file) => URL.createObjectURL(file)),
    ]);
  };

  const removeReviewImage = (index) => {
    setReviewImages((prev) => prev.filter((_, i) => i !== index));
    setReviewImagesPreview((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewRating || !reviewText.trim()) {
      alert("Please provide a rating and review text.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first.");
      navigate("/login");
      return;
    }

    try {
      setSubmittingReview(true);
      const formData = new FormData();
      formData.append("rating", reviewRating);
      formData.append("title", reviewTitle);
      formData.append("text", reviewText);
      reviewImages.forEach((img) => formData.append("images", img));

      await api.post(`/products/${product.id}/add-review/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setReviewSuccess(true);
      setReviewRating(0);
      setReviewTitle("");
      setReviewText("");
      setReviewImages([]);
      setReviewImagesPreview([]);
      
      setTimeout(() => setReviewSuccess(false), 3000);
      fetchReviews(id);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  // =====================================
  // LIGHTBOX HANDLERS
  // =====================================

  const openLightbox = (images, index) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = "unset";
  };

  const prevImage = () => {
    setLightboxIndex((prev) => (prev === 0 ? lightboxImages.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setLightboxIndex((prev) => (prev === lightboxImages.length - 1 ? 0 : prev + 1));
  };

  // =====================================
  // COMPUTED REVIEW STATS
  // =====================================

  const reviewStats = useMemo(() => {
    if (!reviews.length) return { average: 0, counts: [0, 0, 0, 0, 0] };
    
    const total = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = sum / total;
    
    const counts = [0, 0, 0, 0, 0];
    reviews.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) counts[r.rating - 1]++;
    });
    
    return { average: avg, counts, total };
  }, [reviews]);

  // =====================================
  // LOADING UI
  // =====================================

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="product-details-container">
          <div className="product-loading">
            <div className="skeleton-gallery">
              <div className="skeleton-main"></div>
              <div className="skeleton-thumbnails">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="skeleton-thumb"></div>
                ))}
              </div>
            </div>
            <div className="skeleton-info">
              <div className="skeleton-title"></div>
              <div className="skeleton-rating"></div>
              <div className="skeleton-price"></div>
              <div className="skeleton-stock"></div>
              <div className="skeleton-variants"></div>
              <div className="skeleton-actions"></div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // =====================================
  // ERROR UI
  // =====================================

  if (error || !product) {
    return (
      <>
        <Navbar />
        <div className="product-error">
          <div className="error-icon">😕</div>
          <h2>Something went wrong</h2>
          <p>{error || "Product not found"}</p>
          <button onClick={() => navigate("/shop")}>Back to Shop</button>
        </div>
        <Footer />
      </>
    );
  }

  // =====================================
  // PRODUCT UI
  // =====================================

  return (
    <>
      <Navbar />

      {/* =========================
          COMPACT STICKY HEADER (Mobile Only)
      ========================= */}
      <div className={`compact-header ${scrollState.showCompactHeader && isMobile ? 'visible' : ''}`}>
        <button className="compact-back" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <img 
          src={selectedImage} 
          alt={product.productname} 
          className="compact-thumbnail"
        />
        <span className="compact-title">{product.productname}</span>
        <span className="compact-price">₹{sellingPrice}</span>
        <button className="compact-search" onClick={() => navigate("/shop")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </button>
        <button className="compact-share" onClick={() => {
          if (navigator.share) {
            navigator.share({
              title: product.productname,
              text: `Check out ${product.productname} on ClayWare`,
              url: window.location.href,
            });
          }
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </button>
      </div>

      <div className="product-details-container" ref={productRef}>
        {/* =========================
            MAIN PRODUCT SECTION
        ========================= */}
        <div className="product-main-layout" ref={heroRef}>
          {/* IMAGE GALLERY */}
          <div className="product-gallery">
            <div className="thumbnail-list">
              {images.map((img, index) => (
                <div
                  key={index}
                  className={`thumbnail-item ${selectedImage === img ? "active" : ""}`}
                  onClick={() => setSelectedImage(img)}
                >
                  <img src={img} alt={`${product.productname} view ${index + 1}`} />
                </div>
              ))}
            </div>

            <div
              className="main-image-container"
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={resetZoom}
            >
              <img
                src={selectedImage}
                alt={product.productname}
                className="main-product-image"
                style={isZooming ? zoomStyle : { transform: "scale(1)" }}
              />
              {inStock && <span className="stock-badge">In Stock</span>}
            </div>
          </div>

          {/* PRODUCT INFO */}
          <div className="product-info">
            <div className="product-breadcrumb">
              <span>Home</span>
              <span>›</span>
              <span>{product.category?.name || "Products"}</span>
              <span>›</span>
              <span>{product.productname}</span>
            </div>

            <h1 className="product-title">{product.productname}</h1>

            <div className="product-rating-summary">
              <div className="stars">
                {"★".repeat(Math.round(reviewStats.average))}
                {"☆".repeat(5 - Math.round(reviewStats.average))}
              </div>
              <span className="rating-value">{reviewStats.average.toFixed(1)}</span>
              <span className="rating-count">({reviewStats.total} reviews)</span>
              <span className="verified-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#C8622A"/>
                </svg>
                ClayWare Assured
              </span>
            </div>

            <div className="product-price-section">
              <span className="current-price">₹{sellingPrice}</span>
              {mrp !== sellingPrice && (
                <>
                  <span className="original-price">₹{mrp}</span>
                  <span className="discount-badge">{discount}% OFF</span>
                </>
              )}
            </div>

            {/* =====================================
                STOCK STATUS - PREMIUM UI
            ===================================== */}
            <div className="stock-status-container">
              <div 
                className={`stock-status ${stockStatus?.type}`}
                style={{
                  backgroundColor: stockStatus?.bgColor,
                  borderColor: stockStatus?.dotColor
                }}
              >
                <div className="stock-status-content">
                  <div className="stock-status-left">
                    <span 
                      className="stock-dot" 
                      style={{ backgroundColor: stockStatus?.dotColor }}
                    ></span>
                    <div className="stock-status-text">
                      <span 
                        className="stock-label" 
                        style={{ color: stockStatus?.color }}
                      >
                        {stockStatus?.label}
                      </span>
                      <span className="stock-message">
                        {stockStatus?.message}
                      </span>
                    </div>
                  </div>
                  
                  {isOutOfStock && (
                    <button 
                      className="notify-btn"
                      onClick={() => {
                        alert("We'll notify you when this product is back in stock!");
                      }}
                    >
                      Notify Me
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* VARIANTS */}
            {allVariants.length > 1 && (
              <div className="variant-section">
                <h3 className="variant-label">Select Capacity</h3>
                <div className="variant-options">
                  {allVariants.map((variant) => (
                    <button
                      key={variant.id || "standard"}
                      className={`variant-option ${
                        selectedVariant?.id === variant.id &&
                        selectedVariant?.isBase === variant.isBase
                          ? "selected"
                          : ""
                      }`}
                      disabled={Number(variant.stock_quantity) <= 0}
                      onClick={() => handleVariantChange(variant)}
                    >
                      {variant.capacity}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* QUANTITY - Updated with stock info */}
            <div className="quantity-section">
              <label className="quantity-label">Quantity</label>
              <div className="quantity-controls">
                <button 
                  onClick={decreaseQty} 
                  disabled={quantity <= 1 || isOutOfStock}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14" />
                  </svg>
                </button>
                <span className="quantity-value">{quantity}</span>
                <button 
                  onClick={increaseQty} 
                  disabled={quantity >= stock || isOutOfStock}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
              </div>
              {!isOutOfStock && (
                <span className="stock-available">
                  {stock > 10 ? `${stock} available` : `${stock} left`}
                </span>
              )}
            </div>

            {/* ACTION BUTTONS - Updated with disabled states */}
            <div className="action-buttons">
              <button
                className="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={isOutOfStock || addingToCart}
                style={{
                  opacity: isOutOfStock ? '0.5' : '1',
                  cursor: isOutOfStock ? 'not-allowed' : 'pointer'
                }}
              >
                {addingToCart ? (
                  <span className="btn-loader"></span>
                ) : isOutOfStock ? (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
                    </svg>
                    Out of Stock
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
                    </svg>
                    Add to Cart
                  </>
                )}
              </button>
              <button
                className="buy-now-btn"
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                style={{
                  opacity: isOutOfStock ? '0.5' : '1',
                  cursor: isOutOfStock ? 'not-allowed' : 'pointer'
                }}
              >
                {isOutOfStock ? 'Unavailable' : 'Buy Now'}
              </button>
              <button 
                className="wishlist-btn" 
                aria-label="Add to wishlist"
                disabled={isOutOfStock}
                style={{
                  opacity: isOutOfStock ? '0.4' : '1',
                  cursor: isOutOfStock ? 'not-allowed' : 'pointer'
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
              </button>
            </div>

            {/* DELIVERY INFO */}
            <div className="delivery-info">
              <div className="delivery-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C8622A" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <div>
                  <span className="delivery-label">Free Delivery</span>
                  <span className="delivery-detail">Estimated delivery in 3-5 days</span>
                </div>
              </div>
              <div className="delivery-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C8622A" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
                </svg>
                <div>
                  <span className="delivery-label">Secure Payment</span>
                  <span className="delivery-detail">100% secure transactions</span>
                </div>
              </div>
              <div className="delivery-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C8622A" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <div>
                  <span className="delivery-label">Easy Returns</span>
                  <span className="delivery-detail">30-day return policy</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================
            PRODUCT HIGHLIGHTS
        ========================= */}
        <div className="product-highlights">
          {["Handmade", "Premium Clay", "Food Safe", "Eco Friendly", "Natural Materials", "Reusable"].map((highlight, i) => (
            <div key={i} className="highlight-item">
              <span className="highlight-icon">✓</span>
              <span className="highlight-text">{highlight}</span>
            </div>
          ))}
        </div>

        {/* =========================
            TABS SECTION
        ========================= */}
        <div className="product-tabs-section">
          <div className="tabs-header">
            <button
              className={`tab-btn ${activeTab === "description" ? "active" : ""}`}
              onClick={() => setActiveTab("description")}
            >
              Description
            </button>
            <button
              className={`tab-btn ${activeTab === "specifications" ? "active" : ""}`}
              onClick={() => setActiveTab("specifications")}
            >
              Specifications
            </button>
            <button
              className={`tab-btn ${activeTab === "reviews" ? "active" : ""}`}
              onClick={() => setActiveTab("reviews")}
            >
              Reviews ({reviewStats.total})
            </button>
          </div>

          <div className="tab-content">
            {/* DESCRIPTION */}
            {activeTab === "description" && (
              <div className="tab-pane fade-in">
                <p className="product-description-text">{product.description}</p>
                {product.material && (
                  <div className="product-meta">
                    <span><strong>Material:</strong> {product.material}</span>
                    {product.weight && <span><strong>Weight:</strong> {product.weight}</span>}
                    {product.color && <span><strong>Color:</strong> {product.color}</span>}
                  </div>
                )}
              </div>
            )}

            {/* SPECIFICATIONS */}
            {activeTab === "specifications" && (
              <div className="tab-pane fade-in">
                <table className="specs-table">
                  <tbody>
                    <tr><td>Product Name</td><td>{product.productname}</td></tr>
                    {product.material && <tr><td>Material</td><td>{product.material}</td></tr>}
                    {product.category?.name && <tr><td>Category</td><td>{product.category.name}</td></tr>}
                    <tr><td>Price</td><td>₹{sellingPrice}</td></tr>
                    {mrp !== sellingPrice && <tr><td>Original Price</td><td>₹{mrp}</td></tr>}
                    <tr><td>Stock</td><td>{stockStatus?.label || 'Out of Stock'}</td></tr>
                    {product.weight && <tr><td>Weight</td><td>{product.weight}</td></tr>}
                    {product.color && <tr><td>Color</td><td>{product.color}</td></tr>}
                    {selectedVariant?.capacity && !selectedVariant.isBase && (
                      <tr><td>Capacity</td><td>{selectedVariant.capacity}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* REVIEWS */}
            {activeTab === "reviews" && (
              <div className="tab-pane fade-in">
                <div className="reviews-section">
                  {/* Review Summary */}
                  <div className="reviews-summary">
                    <div className="summary-rating">
                      <span className="average-rating">{reviewStats.average.toFixed(1)}</span>
                      <div className="stars-large">
                        {"★".repeat(Math.round(reviewStats.average))}
                        {"☆".repeat(5 - Math.round(reviewStats.average))}
                      </div>
                      <span className="total-reviews">{reviewStats.total} reviews</span>
                    </div>
                    <div className="rating-distribution">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = reviewStats.counts[star - 1] || 0;
                        const percentage = reviewStats.total > 0 ? (count / reviewStats.total) * 100 : 0;
                        return (
                          <div key={star} className="distribution-row">
                            <span className="star-label">{star}★</span>
                            <div className="progress-bar">
                              <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
                            </div>
                            <span className="progress-count">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Write Review */}
                  {canReview && !reviewSuccess && (
                    <div className="write-review-card">
                      <h3>Write a Review</h3>
                      <form onSubmit={handleSubmitReview}>
                        <div className="rating-select">
                          <label>Your Rating</label>
                          <div className="star-select">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                className={`star-btn ${reviewRating >= star ? "active" : ""}`}
                                onClick={() => setReviewRating(star)}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Review Title</label>
                          <input
                            type="text"
                            value={reviewTitle}
                            onChange={(e) => setReviewTitle(e.target.value)}
                            placeholder="Summarize your experience"
                            maxLength="100"
                          />
                        </div>
                        <div className="form-group">
                          <label>Review</label>
                          <textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            placeholder="Share your honest feedback about this product"
                            rows="4"
                            maxLength="500"
                          />
                          <span className="char-count">{reviewText.length}/500</span>
                        </div>
                        <div className="form-group">
                          <label>Upload Images</label>
                          <div className="image-upload-area">
                            {reviewImagesPreview.length < 5 && (
                              <label className="upload-btn">
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  onChange={handleReviewImageUpload}
                                  hidden
                                />
                                <span>+ Upload Images</span>
                              </label>
                            )}
                            {reviewImagesPreview.map((preview, index) => (
                              <div key={index} className="uploaded-image">
                                <img src={preview} alt={`Review ${index + 1}`} />
                                <button
                                  type="button"
                                  className="remove-image"
                                  onClick={() => removeReviewImage(index)}
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                          <small>Up to 5 images</small>
                        </div>
                        <button
                          type="submit"
                          className="submit-review-btn"
                          disabled={submittingReview}
                        >
                          {submittingReview ? <span className="btn-loader"></span> : "Submit Review"}
                        </button>
                      </form>
                    </div>
                  )}

                  {reviewSuccess && (
                    <div className="review-success">
                      ✓ Review submitted successfully!
                    </div>
                  )}

                  {/* Reviews List */}
                  <div className="reviews-list">
                    {reviewsLoading ? (
                      <div className="reviews-loading">
                        Loading reviews...
                      </div>
                    ) : reviews.length === 0 ? (
                      <div className="no-reviews">
                        No reviews yet.
                      </div>
                    ) : (
                      reviews.map((review) => (
                        <div key={review.id} className="review-card">
                          <div className="review-header">
                            <div className="reviewer-info">
                              {review.profile_image ? (
                                <img
                                  src={review.profile_image}
                                  alt={review.user_name}
                                  className="reviewer-avatar"
                                />
                              ) : (
                                <div className="reviewer-avatar-placeholder">
                                  {(review.user_name || "U").charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <h4>{review.user_name || "Anonymous"}</h4>
                                <small>{new Date(review.created_at).toLocaleDateString()}</small>
                              </div>
                            </div>
                          </div>
                          <div className="review-stars">
                            {"★".repeat(review.rating)}
                            {"☆".repeat(5 - review.rating)}
                          </div>
                          <p className="review-text">{review.review}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* =========================
            RELATED PRODUCTS
        ========================= */}
        {relatedProducts.length > 0 && (
          <div className="related-products">
            <h2 className="section-title">You May Also Like</h2>
            <div className="related-grid">
              {relatedProducts.map((item) => (
                <div
                  key={item.id}
                  className="related-card"
                  onClick={() => navigate(`/product/${item.id}`)}
                >
                  <div className="related-image">
                    <img
                      src={item.images?.[0] || item.product_images?.[0]?.image || "/placeholder.jpg"}
                      alt={item.productname}
                    />
                    {item.discount_price && Number(item.discount_price) < Number(item.price) && (
                      <span className="related-discount">
                        {Math.round(((Number(item.price) - Number(item.discount_price)) / Number(item.price)) * 100)}% OFF
                      </span>
                    )}
                  </div>
                  <h3 className="related-name">{item.productname}</h3>
                  <div className="related-price">
                    <span className="related-current">₹{item.discount_price || item.price}</span>
                    {item.price && item.discount_price && Number(item.discount_price) < Number(item.price) && (
                      <span className="related-original">₹{item.price}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* =========================
          LIGHTBOX MODAL
      ========================= */}
      {lightboxOpen && (
        <div className="lightbox-modal" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox}>✕</button>
            <button className="lightbox-prev" onClick={prevImage}>‹</button>
            <img
              src={lightboxImages[lightboxIndex]}
              alt={`Review ${lightboxIndex + 1}`}
              className="lightbox-image"
            />
            <button className="lightbox-next" onClick={nextImage}>›</button>
            <span className="lightbox-counter">{lightboxIndex + 1} / {lightboxImages.length}</span>
          </div>
        </div>
      )}

      {/* =========================
          MOBILE STICKY BAR - Updated with Scroll Behavior
      ========================= */}
      <div className={`mobile-sticky-bar ${scrollState.showStickyBar && isMobile ? 'visible' : ''}`}>
        <div className="sticky-price">₹{sellingPrice}</div>
        <div className="sticky-actions">
          <button 
            onClick={handleAddToCart} 
            disabled={isOutOfStock || addingToCart}
            style={{
              opacity: isOutOfStock ? '0.5' : '1',
              cursor: isOutOfStock ? 'not-allowed' : 'pointer'
            }}
          >
            {addingToCart ? "..." : isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </button>
          <button 
            className="sticky-buy" 
            onClick={handleBuyNow} 
            disabled={isOutOfStock}
            style={{
              opacity: isOutOfStock ? '0.5' : '1',
              cursor: isOutOfStock ? 'not-allowed' : 'pointer'
            }}
          >
            {isOutOfStock ? "Unavailable" : "Buy Now"}
          </button>
        </div>
      </div>

      <WhyChooseUs />
      <Footer />
    </>
  );
}

export default ProductDetails;