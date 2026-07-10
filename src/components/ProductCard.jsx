import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
    FaHeart,
    FaRegHeart,
    FaStar,
    FaShoppingCart,
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

            const response = await axios.get(
                "http://127.0.0.1:8000/api/accounts/home-page/"
            );

            const data = response.data.products || [];

            setProducts(data);

            const images = {};

            data.forEach((product) => {

                if (product.images && product.images.length > 0) {

                    images[product.id] = product.images[0].image;

                } else {

                    images[product.id] =
                        product.image ||
                        "https://placehold.co/600x600";

                }

            });

            setSelectedImages(images);

        } catch (err) {

            console.log(err);

        } finally {

            setLoading(false);

        }

    };

    const toggleWishlist = (e, id) => {

        e.stopPropagation();

        if (wishlist.includes(id)) {

            setWishlist(
                wishlist.filter(item => item !== id)
            );

        } else {

            setWishlist([...wishlist, id]);

        }

    };

    const changeImage = (e, productId, image) => {

        e.stopPropagation();

        setSelectedImages(prev => ({
            ...prev,
            [productId]: image
        }));

    };

    const handleAddToCart = (e, product) => {

        e.stopPropagation();

        console.log("Add To Cart", product);

    };

    if (loading) {

        return (

            <div className="store-loader">

                <div className="loader-circle"></div>

            </div>

        );

    }

    return (

        <section className="premium-products">

            <div className="premium-grid">

                {products.map((product) => {

                    const hasDiscount =
                        product.discount_price &&
                        Number(product.discount_price) <
                            Number(product.price);

                    const currentPrice =
                        product.discount_price ||
                        product.price;

                    const discount = hasDiscount
                        ? Math.round(
                              ((Number(product.price) -
                                  Number(product.discount_price)) /
                                  Number(product.price)) *
                                  100
                          )
                        : 0;

                    return (

                        <div
                            className="premium-card"
                            key={product.id}
                            onClick={() =>
                                navigate(`/product/${product.id}`)
                            }
                        >

                            <div className="premium-image-box">

                                {hasDiscount && (

                                    <span className="discount-badge">

                                        -{discount}% OFF

                                    </span>

                                )}

                                <button
                                    className="wishlist-btn"
                                    onClick={(e) =>
                                        toggleWishlist(e, product.id)
                                    }
                                >

                                    {wishlist.includes(product.id)
                                        ? <FaHeart />
                                        : <FaRegHeart />}

                                </button>

                                <img
                                    src={
                                        selectedImages[product.id] ||
                                        "https://placehold.co/600x600"
                                    }
                                    alt={product.productname}
                                />

                            </div>

                            {product.images &&
                                product.images.length > 1 && (

                                <div className="thumbnail-row">

                                    {product.images
                                        .slice(0,4)
                                        .map((img)=>(
                                                                                    <img
                                            key={img.id}
                                            src={img.image}
                                            alt={product.productname}
                                            onMouseEnter={(e) =>
                                                changeImage(
                                                    e,
                                                    product.id,
                                                    img.image
                                                )
                                            }
                                            onClick={(e) =>
                                                changeImage(
                                                    e,
                                                    product.id,
                                                    img.image
                                                )
                                            }
                                        />
                                    ))}

                                </div>

                            )}

                            <div className="premium-content">

                                <span className="category">
                                    {product.item || "Clayware"}
                                </span>

                                <h3>
                                    {product.productname}
                                </h3>

                                <div className="rating">

                                    <FaStar />
                                    <FaStar />
                                    <FaStar />
                                    <FaStar />
                                    <FaStar />

                                    <span>
                                        (4.8)
                                    </span>

                                </div>

                                <div className="price-row">

                                    <span className="price">

                                        ₹
                                        {Number(
                                            currentPrice
                                        ).toLocaleString(
                                            "en-IN"
                                        )}

                                    </span>

                                    {hasDiscount && (

                                        <span className="old-price">

                                            ₹
                                            {Number(
                                                product.price
                                            ).toLocaleString(
                                                "en-IN"
                                            )}

                                        </span>

                                    )}

                                </div>

                                {product.variants &&
                                    product.variants.length >
                                        0 && (

                                    <div className="variant-list">

                                        {product.variants
                                            .slice(0,3)
                                            .map(
                                                (
                                                    variant
                                                ) => (

                                                    <span
                                                        key={
                                                            variant.id
                                                        }
                                                    >

                                                        {
                                                            variant.capacity
                                                        }

                                                    </span>

                                                )
                                            )}

                                    </div>

                                )}

                                <button
                                    className="cart-btn"
                                    disabled={
                                        product.stock_quantity ===
                                        0
                                    }
                                    onClick={(e) =>
                                        handleAddToCart(
                                            e,
                                            product
                                        )
                                    }
                                >

                                    <FaShoppingCart />

                                    <span>

                                        {product.stock_quantity ===
                                        0
                                            ? "Out of Stock"
                                            : "Add To Cart"}

                                    </span>

                                </button>

                            </div>

                        </div>

                    );

                })}

            </div>

        </section>

    );

}

export default ProductCard;