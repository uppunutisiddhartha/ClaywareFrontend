import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./styles/ProductDetails.css";
import WhyChooseUs from "../components/WhyChooseUs";

function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedImage, setSelectedImage] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null);

  const [quantity, setQuantity] = useState(1);

  const [zoomStyle, setZoomStyle] = useState({});
  const [isZooming, setIsZooming] = useState(false);

  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    axios
      .get(`http://127.0.0.1:8000/api/accounts/product/${id}/`)
      .then((res) => {
        if (cancelled) return;

        const data = res.data;

        setProduct(data);

        const imgs =
          data.product_images?.map((img) => img.image) ||
          data.images ||
          [];

        if (imgs.length > 0) {
          setSelectedImage(imgs[0]);
        }

        // Default selection is Standard Product
        setSelectedVariant({
          id: null,
          capacity: "Standard",
          price: data.price,
          discount_price: data.discount_price,
          stock_quantity: data.stock_quantity,
          isBase: true,
        });
      })
      .catch(() => {
        if (!cancelled) {
          setError("We couldn't load this product. Please try again.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="pdp-loader-container">
        <div className="pdp-spinner" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pdp-page">
        <Navbar />
        <div className="pdp-error-container">
          <p>{error || "Product not found."}</p>
        </div>
        <Footer />
      </div>
    );
  }

  const images =
    product.product_images?.map((i) => i.image) ||
    product.images ||
    [];

  // ==========================
  // Standard + Variants
  // ==========================
  const allVariants = [
    {
      id: null,
      capacity: "Standard",
      price: product.price,
      discount_price: product.discount_price,
      stock_quantity: product.stock_quantity,
      isBase: true,
    },

    ...(product.variants || []).map((v) => ({
      ...v,
      isBase: false,
    })),
  ];

  const mrp = Number(selectedVariant?.price || 0);

  const sellingPrice =
    selectedVariant?.discount_price &&
    Number(selectedVariant.discount_price) < mrp
      ? Number(selectedVariant.discount_price)
      : mrp;

  const discount =
    mrp > sellingPrice
      ? Math.round(((mrp - sellingPrice) / mrp) * 100)
      : 0;

  const stock = Number(selectedVariant?.stock_quantity || 0);

  const inStock = stock > 0;

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

  const decreaseQty = () => {
    setQuantity((q) => Math.max(1, q - 1));
  };

  const increaseQty = () => {
    setQuantity((q) => Math.min(stock || 1, q + 1));
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first.");
      return;
    }

    try {
      setAddingToCart(true);

      const response = await axios.post(
        `https://claywarebackend.onrender.com/api/user/addtocart/${product.id}/`,
        {
          quantity: quantity,
          variant_id: selectedVariant?.isBase
            ? null
            : selectedVariant.id,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      alert(response.data.message);

      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error(error);

      if (error.response?.status === 401) {
        alert("Please login again.");
      } else if (error.response?.status === 403) {
        alert("Only customers can add products to cart.");
      } else {
        alert(
          error.response?.data?.message ||
            "Unable to add product to cart."
        );
      }
    } finally {
      setAddingToCart(false);
    }
  };

    return (
    <div className="pdp-page">
      <Navbar />

      <div className="pdp-container">

        {/* LEFT */}
        <div className="pdp-left">

          <div className="pdp-thumbs">
            {images.map((img, index) => (
              <button
                key={index}
                className={`thumb-btn ${
                  selectedImage === img ? "active" : ""
                }`}
                onClick={() => setSelectedImage(img)}
              >
                <img
                  src={img}
                  alt={`thumb-${index}`}
                  className="thumb"
                />
              </button>
            ))}
          </div>

          <div
            className={`pdp-image-box ${
              isZooming ? "zooming" : ""
            }`}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={resetZoom}
          >
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={product.productname}
                className="main-img"
                style={zoomStyle}
              />
            ) : (
              <div className="no-image">
                No Image Available
              </div>
            )}
          </div>

        </div>

        {/* RIGHT */}
        <div className="pdp-right">

          <p className="brand">
            {product.seller}
          </p>

          <h1 className="title">
            {product.productname}
          </h1>

          <div className="price-box">

            <span className="price">
              ₹{sellingPrice}
            </span>

            {discount > 0 && (
              <>
                <span className="mrp">
                  ₹{mrp}
                </span>

                <span className="off">
                  {discount}% OFF
                </span>
              </>
            )}

          </div>

          <p className={`stock-pill ${inStock ? "in" : "out"}`}>
            {inStock
              ? `${stock} in stock`
              : "Out of stock"}
          </p>

          {/* VARIANTS */}

          <div className="variants">

            <h4>Available Options</h4>

            <div className="variant-list">

              {allVariants.map((variant) => {

                const active =
                  selectedVariant?.id === variant.id &&
                  selectedVariant?.isBase === variant.isBase;

                return (

                  <button
  key={variant.isBase ? "base" : variant.id}
  className={`variant ${
    active ? "active" : ""
  } ${
    Number(variant.stock_quantity) <= 0
      ? "out-of-stock"
      : ""
  }`}
  onClick={() => setSelectedVariant(variant)}
>

  <span className="variant-capacity">
    {variant.capacity}
  </span>

  <span className="variant-price">
    ₹{variant.discount_price || variant.price}
  </span>

  {variant.discount_price &&
    Number(variant.discount_price) <
      Number(variant.price) && (
      <span className="variant-mrp">
        ₹{variant.price}
      </span>
  )}

  <span className="variant-stock">
    {variant.stock_quantity > 0
      ? `${variant.stock_quantity} Available`
      : "Out of Stock"}
  </span>

</button>

                );
              })}

            </div>

          </div>
                    {/* ABOUT PRODUCT */}
          <div className="about-block">
            <h4 className="section-title">
              About this product
            </h4>

            <div className="about-card">
              <p className="about-text">
                {product.description?.trim()
                  ? product.description
                  : "This product is crafted with premium quality materials, designed for durability and daily use."}
              </p>
            </div>
          </div>

          {/* QUANTITY */}
          <div className="quantity-block">

            <h4>Quantity</h4>

            <div className="quantity-stepper">

              <button
                onClick={decreaseQty}
                disabled={!inStock}
              >
                −
              </button>

              <span className="quantity-value">
                {quantity}
              </span>

              <button
                onClick={increaseQty}
                disabled={!inStock}
              >
                +
              </button>

            </div>

          </div>

          {/* ACTIONS */}
          <div className="actions">

            <button
              className="add-to-cart"
              disabled={!inStock || addingToCart}
              onClick={handleAddToCart}
            >
              {addingToCart
                ? "Adding..."
                : "Add to Cart"}
            </button>

            <button
              className="buy"
              disabled={!inStock}
            >
              Buy Now
            </button>

          </div>

        </div>

      </div>

      <div className="Why">
        <WhyChooseUs />
      </div>

      <Footer />

    </div>
  );
}

export default ProductDetails;