import { useEffect, useState } from "react";
import axios from "axios";
import "./OfferBanner.css";

function Home() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/marketing/banner/home/")
      .then((res) => {
        setBanners(res.data.banners);
      })
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home-banner-wrapper">
      {loading ? (
        <div className="banner-loader">Loading offers...</div>
      ) : (
        <div className="banner-grid">
          {banners.map((b) => (
            <div key={b.id} className="banner-card">
              
              <div className="banner-glow"></div>

              <div className="banner-content">
                <span className="badge">🔥 Limited Offer</span>

                <h1>{b.title}</h1>
                <h3>{b.tagLine}</h3>
                <p>{b.matter}</p>

                <button className="banner-btn">
                  Shop Now →
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;