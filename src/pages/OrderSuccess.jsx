import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  FiCheckCircle,
  FiShoppingBag,
  FiTruck,
  FiHome,
  FiMapPin,
  FiCalendar,
  FiCreditCard,
  FiPackage,
  FiShield,
  FiRefreshCw,
  FiHeadphones,
  FiGift,
  FiArrowRight,
} from "react-icons/fi";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import "./styles/OrderSuccess.css";

function OrderSuccess() {
  const [showConfetti, setShowConfetti] = useState(true);

  const order = {
    orderId:
      "CW" +
      Math.floor(100000 + Math.random() * 900000),

    date: new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),

    payment: "Cash On Delivery",

    total: "₹2,499",

    address:
      "Hyderabad, Telangana",

    delivery:
      "Estimated Delivery : 3 - 5 Days",
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 7000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Navbar />

      <div className="order-success-page">

        {/* HERO */}

        <section className="success-hero">

          <div className="success-circle">

            <FiCheckCircle />

          </div>

          <h1>
            Order Placed Successfully!
          </h1>

          <p>
            Thank you for shopping with
            <strong> ClayWare.</strong>

            <br />

            Your handcrafted products are now
            being prepared with care.
          </p>

          <div className="order-id-card">

            <span>Order ID</span>

            <h2>#{order.orderId}</h2>

          </div>

        </section>

        {/* DETAILS */}

        <section className="order-info-grid">

          <div className="info-card">

            <FiCalendar />

            <h4>Order Date</h4>

            <p>{order.date}</p>

          </div>

          <div className="info-card">

            <FiMapPin />

            <h4>Shipping Address</h4>

            <p>{order.address}</p>

          </div>

          <div className="info-card">

            <FiCreditCard />

            <h4>Payment</h4>

            <p>{order.payment}</p>

          </div>

          <div className="info-card">

            <FiPackage />

            <h4>Total Paid</h4>

            <p>{order.total}</p>

          </div>

        </section>

        {/* TIMELINE */}

        <section className="timeline-section">

          <h2>

            Order Journey

          </h2>

          <div className="timeline">

            <div className="timeline-item active">

              <div className="timeline-icon">

                <FiCheckCircle />

              </div>

              <h4>Confirmed</h4>

              <p>
                Order received
              </p>

            </div>

            <div className="timeline-line"></div>

            <div className="timeline-item">

              <div className="timeline-icon">

                🏺

              </div>

              <h4>Preparing</h4>

              <p>
                Handmade with care
              </p>

            </div>

            <div className="timeline-line"></div>

            <div className="timeline-item">

              <div className="timeline-icon">

                <FiTruck />

              </div>

              <h4>Shipped</h4>

              <p>
                On the way
              </p>

            </div>

            <div className="timeline-line"></div>

            <div className="timeline-item">

              <div className="timeline-icon">

                <FiHome />

              </div>

              <h4>Delivered</h4>

              <p>
                Enjoy!
              </p>

            </div>

          </div>

        </section>

        {/* DELIVERY */}

        <section className="delivery-box">

          <FiGift />

          <div>

            <h3>

              {order.delivery}

            </h3>

            <p>

              We will notify you by SMS &
              Email once your package is
              shipped.

            </p>

          </div>

        </section>

        {/* FEATURE CARDS */}

        <section className="features-grid">

          <div className="feature-card">

            <FiShield />

            <h4>

              Secure Checkout

            </h4>

            <p>

              Protected payment &
              encrypted transactions.

            </p>

          </div>

          <div className="feature-card">

            <FiTruck />

            <h4>

              Fast Delivery

            </h4>

            <p>

              Carefully packed &
              delivered safely.

            </p>

          </div>

          <div className="feature-card">

            <FiRefreshCw />

            <h4>

              Easy Returns

            </h4>

            <p>

              Hassle-free replacement
              and return policy.

            </p>

          </div>

          <div className="feature-card">

            <FiHeadphones />

            <h4>

              Support

            </h4>

            <p>

              Our team is always
              available to help you.

            </p>

          </div>

        </section>

        {/* RECOMMENDATIONS */}

        <section className="recommended-section">

          <div className="section-title">

            <h2>

              You may also love

            </h2>

          </div>

          <div className="recommend-grid">

            <div className="recommend-card">

              <img
                src="/images/sample1.jpg"
                alt=""
              />

              <h4>

                Clay Water Pot

              </h4>

              <span>

                ₹799

              </span>

            </div>

            <div className="recommend-card">

              <img
                src="/images/sample2.jpg"
                alt=""
              />

              <h4>

                Tea Cup Set

              </h4>

              <span>

                ₹499

              </span>

            </div>

            <div className="recommend-card">

              <img
                src="/images/sample3.jpg"
                alt=""
              />

              <h4>

                Decorative Vase

              </h4>

              <span>

                ₹999

              </span>

            </div>

            <div className="recommend-card">

              <img
                src="/images/sample4.jpg"
                alt=""
              />

              <h4>

                Dinner Bowl

              </h4>

              <span>

                ₹649

              </span>

            </div>

          </div>

        </section>

        {/* BUTTONS */}

        <section className="success-buttons">

          <Link
            to="/shop"
            className="continue-btn"
          >
            <FiShoppingBag />

            Continue Shopping

          </Link>

          <Link
            to="/my-orders"
            className="track-btn"
          >
            Track Order

            <FiArrowRight />

          </Link>

        </section>

      </div>

      <Footer />
    </>
  );
}

export default OrderSuccess;