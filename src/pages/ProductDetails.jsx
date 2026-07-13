import { useEffect, useState } from "react";
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

        // Images
        const imgs =
          data.product_images?.map((img) => img.image) || data.images || [];

        if (imgs.length > 0) {
          setSelectedImage(imgs[0]);
        }

        // =====================================
        // AUTO SELECT FIRST AVAILABLE VARIANT
        // =====================================

        if (data.variants && data.variants.length > 0) {
          // First variant having stock
          const availableVariant =
            data.variants.find((v) => Number(v.stock_quantity) > 0) ||
            data.variants[0];

          setSelectedVariant({
            ...availableVariant,
            isBase: false,
          });
        } else {
          // Product without variants
          setSelectedVariant({
            id: null,
            capacity: "Standard",
            price: data.price,
            discount_price: data.discount_price,
            stock_quantity: data.stock_quantity,
            isBase: true,
          });
        }
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
  // PRODUCT IMAGES
  // =====================================

  const images =
    product?.product_images?.map((img) => img.image) || product?.images || [];

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

  const sellingPrice =
    selectedVariant?.discount_price &&
    Number(selectedVariant.discount_price) < mrp
      ? Number(selectedVariant.discount_price)
      : mrp;

  const discount =
    mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;

  // =====================================
  // STOCK
  // =====================================

  const stock = Number(selectedVariant?.stock_quantity || 0);

  const inStock = stock > 0;

  let stockMessage = "Out of Stock";

  if (stock > 10) {
    stockMessage = `${stock} in stock`;
  } else if (stock > 0) {
    stockMessage = `Only ${stock} left`;
  }

  // =====================================
  // IMAGE ZOOM
  // =====================================

  const handleMouseMove = (e) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();

    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: "scale(2)",
    });
  };

  const handleMouseEnter = () => {
    setIsZooming(true);
  };

  const resetZoom = () => {
    setIsZooming(false);

    setZoomStyle({
      transform: "scale(1)",
    });
  };

  // =====================================
  // QUANTITY
  // =====================================

  const decreaseQty = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const increaseQty = () => {
    if (quantity < stock) {
      setQuantity((prev) => prev + 1);
    }
  };

  // Reset quantity whenever variant changes

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

    // Change image if variant has image (future support)
    if (variant.image) {
      setSelectedImage(variant.image);
    }
  };

  // =====================================
  // LOADING UI
  // =====================================

  if (loading) {
    return (
      <>
        <Navbar />

        <div className="product-loader">
          <div className="clay-loader"></div>
          <p>Loading product...</p>
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

      <section className="product-details-container">
        {/* =========================
            IMAGE SECTION
        ========================= */}

        <div className="product-gallery">
          <div className="thumbnail-list">
            {images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={product.productname}
                className={selectedImage === img ? "active-thumb" : ""}
                onClick={() => setSelectedImage(img)}
              />
            ))}
          </div>

          <div
            className="main-image-box"
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={resetZoom}
          >
            <img
              src={selectedImage}
              alt={product.productname}
              style={
                isZooming
                  ? zoomStyle
                  : {
                      transform: "scale(1)",
                    }
              }
              className="main-product-image"
            />
          </div>
        </div>

        {/* =========================
            PRODUCT INFO
        ========================= */}

        <div className="product-info">
          <h1>{product.productname}</h1>

          <div className="rating-box">
            ⭐ 4.5
            <span>(120 Reviews)</span>
          </div>

          <p className="description">{product.description}</p>

          {/* PRICE */}

          <div className="price-section">
            {discount > 0 && <span className="discount">{discount}% OFF</span>}

            <h2>₹{sellingPrice}</h2>

            {mrp !== sellingPrice && <del>₹{mrp}</del>}
          </div>

          {/* STOCK */}

          <div className={inStock ? "stock available" : "stock unavailable"}>
            {stockMessage}
          </div>

          {/* =====================
              VARIANTS
          ====================== */}

          {allVariants.length > 1 && (
            <div className="variant-section">
              <h3>Select Capacity</h3>

              <div className="variant-buttons">
                {allVariants.map((variant) => (
                  <button
                    key={variant.id || "standard"}
                    className={
                      selectedVariant?.id === variant.id &&
                      selectedVariant?.isBase === variant.isBase
                        ? "selected"
                        : ""
                    }
                    disabled={Number(variant.stock_quantity) <= 0}
                    onClick={() => handleVariantChange(variant)}
                  >
                    {variant.capacity}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* QUANTITY */}

          <div className="quantity-section">
            <button onClick={decreaseQty}>-</button>

            <span>{quantity}</span>

            <button onClick={increaseQty} disabled={quantity >= stock}>
              +
            </button>
          </div>
          {/* =====================
              ACTION BUTTONS
          ====================== */}

          <div className="action-buttons">
            <button
              className="add-cart-btn"
              onClick={handleAddToCart}
              disabled={!inStock || addingToCart}
            >
              {addingToCart ? "Adding..." : "Add to Cart"}
            </button>

            <button
              className="buy-now-btn"
              onClick={handleBuyNow}
              disabled={!inStock}
            >
              Buy Now
            </button>
          </div>

          {/* =====================
              PRODUCT FEATURES
          ====================== */}

          <div className="product-features">
            <div className="feature-card">
              🚚
              <div>
                <h4>Free Delivery</h4>

                <p>On orders above ₹350</p>
              </div>
            </div>

            <div className="feature-card">
              🛡️
              <div>
                <h4>ClayWare Assured</h4>

                <p>Quality checked products</p>
              </div>
            </div>

            <div className="feature-card">
              🔄
              <div>
                <h4>Easy Returns</h4>

                <p>Hassle free replacement</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          WHY CHOOSE US
      ========================== */}

      <WhyChooseUs />

      {/* =========================
          FOOTER
      ========================== */}

      <Footer />
    </>
  );
}

export default ProductDetails;
