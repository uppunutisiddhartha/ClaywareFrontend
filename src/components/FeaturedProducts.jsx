import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./FeaturedProducts.css";

function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("accounts/home-page/")
      .then(res => {
        setProducts(res.data.products || []);
      })
      .catch(err => console.error("Error fetching products:", err));
  }, []);

  return (
    <section className="minimal-featured-section">
      <div className="section-header-row">
        <div className="header-text">
          <span className="section-label">Curated Collection</span>
          <h2>Featured Objects</h2>
        </div>
        <button className="global-explore-btn" onClick={() => navigate("/shop")}>
          View All Collection <span className="btn-arrow">→</span>
        </button>
      </div>

      <div className="minimal-product-grid">
        {products.slice(0, 3).map(product => {
          const hasDiscount = product.price && product.discount_price && product.price > product.discount_price;

          return (
            <div 
              className="studio-product-card" 
              key={product.id}
              onClick={() => navigate(`/product/${product.id}`)}
            >
              {/* IMAGE FRAME WITH BORDER LAYOUT */}
              <div className="card-media-wrapper">
                {hasDiscount && <span className="minimal-discount-tag">Sale</span>}
                <img
                  src={product.image || "https://placehold.co/600x800"}
                  alt={product.productname}
                  className="studio-img"
                />
              </div>

              {/* CARD DETAILS LAYOUT */}
              <div className="card-meta-content">
                <div className="title-price-row">
                  <h3 className="item-title">{product.productname}</h3>
                  <div className="item-pricing">
                    <span className="current-amt">₹{product.discount_price}</span>
                    {hasDiscount && <span className="slashed-amt">₹{product.price}</span>}
                  </div>
                </div>

                <p className="item-snippet">{product.description}</p>

                {/* THE ELEGANT ACTION TRIGGER WITH ANIMATION LOOP */}
                <div className="interactive-action-trigger">
                  <span className="action-label-text">Explore Product</span>
                  <div className="minimal-arrow-circle">
                    <svg className="arrow-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default FeaturedProducts;