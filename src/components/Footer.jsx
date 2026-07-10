import "./Footer.css";
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* Brand Column */}
        <div className="footer-brand">
          <h2>CLAYWARE</h2>
          <p>
            Curating handcrafted ceramics for the modern home. Our pieces are 
            designed to bring beauty and intention to your daily rituals.
          </p>
        </div>

        {/* Collection Column */}
        <div className="footer-section">
          <h3>COLLECTION</h3>
          <a href="/dinnerware">Dinnerware</a>
          <a href="/vases-decor">Vases & Decor</a>
          <a href="/drinkware">Drinkware</a>
          <a href="/new-arrivals">New Arrivals</a>
        </div>

        {/* Company Column */}
        <div className="footer-section">
          <h3>COMPANY</h3>
          <a href="/our-story">Our Story</a>
          <a href="/sustainability">Sustainability</a>
          <a href="/my-account">My Account</a>
          <a href="/shipping-returns">Shipping & Returns</a>
        </div>

        {/* Connect Column */}
        <div className="footer-section contact-info">
          <h3>CONNECT</h3>
          <p><FiMail className="contact-icon" /> hello@clayware.com</p>
          <p><FiPhone className="contact-icon" /> (555) 123-4567</p>
          <p><FiMapPin className="contact-icon" /> 123 Pottery Lane, Ceramics, CA</p>
        </div>

      </div>

      {/* Sub-Footer Layout */}
      <div className="footer-bottom">
        <div className="footer-socials">
          <a href="#instagram">INSTAGRAM</a>
          <a href="#facebook">FACEBOOK</a>
          <a href="#pinterest">PINTEREST</a>
        </div>
        <p className="copyright">
          © {new Date().getFullYear()} CLAYWARE HANDMADE POTTERY. ALL RIGHTS RESERVED.
        </p>
      </div>
    </footer>
  );
}

export default Footer;