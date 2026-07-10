import "./WhyChooseUs.css";
// We use 'fi' here because we know your project already has it installed and working!
import { FiHeart, FiTruck, FiShield } from "react-icons/fi"; 

function WhyChooseUs() {
  return (
    <section className="why-choose-us">
      <div className="features-grid">
        
        {/* Pillar 1 - Eco Friendly / Handmade Artisan focus */}
        <div className="feature-item">
          <div className="feature-icon-wrapper">
            <FiHeart className="feature-icon" />
          </div>
          <h3>Eco-Friendly Wares</h3>
          <p>100% natural, non-toxic, and sustainable heritage earthenware crafted for conscious living.</p>
        </div>

        {/* Pillar 2 - Easy & Safe Delivery */}
        <div className="feature-item">
          <div className="feature-icon-wrapper">
            <FiTruck className="feature-icon" />
          </div>
          <h3>Easy & Safe Delivery</h3>
          <p>Bespoke packaging engineered explicitly to protect fragile pottery for frictionless nationwide transit.</p>
        </div>

        {/* Pillar 3 - Secure Payments / Trusted Ecosystem */}
        <div className="feature-item">
          <div className="feature-icon-wrapper">
            <FiShield className="feature-icon" />
          </div>
          <h3>Secure Payments</h3>
          <p>A unified, transparent, and completely verified marketplace ensuring safe and trusted transactions.</p>
        </div>

      </div>
    </section>
  );
}

export default WhyChooseUs;