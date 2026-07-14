import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

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
import api from "../api/axios";

import "./styles/OrderSuccess.css";

function OrderSuccess() {

  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {

    const fetchOrder = async () => {

      try {

        if (!orderId) {
          setError("Order ID not found.");
          setLoading(false);
          return;
        }

        const response = await api.get(
          `/order/success/${orderId}/`
        );

        console.log(response.data);

        if (response.data.success) {
          setOrder(response.data.order);
        } else {
          setError(response.data.message);
        }

      } catch (err) {

        console.log(err);

        setError("Unable to load order.");

      } finally {

        setLoading(false);

      }

    };

    fetchOrder();

  }, [orderId]);



  if (loading) {
    return (
      <>
        <Navbar />

        <div className="order-success-page">
          <h2>Loading Order...</h2>
        </div>

        <Footer />
      </>
    );
  }



  if (error) {
    return (
      <>
        <Navbar />

        <div className="order-success-page">
          <h2>{error}</h2>

          <Link to="/shop">
            Continue Shopping
          </Link>
        </div>

        <Footer />
      </>
    );
  }



  return (
    <>

      <Navbar />

      <div className="order-success-page">

        <section className="success-hero">

          <div className="success-circle">
            <FiCheckCircle />
          </div>

          <h1>Order Placed Successfully!</h1>

          <p>
            Thank you for shopping with
            <strong> ClayWare</strong>.
          </p>

          <div className="order-id-card">
            <span>Order ID</span>
            <h2>#CW{order.id}</h2>
          </div>

        </section>



        <section className="order-info-grid">

          <div className="info-card">
            <FiCalendar />
            <h4>Order Date</h4>
            <p>
              {new Date(order.date).toLocaleDateString("en-IN")}
            </p>
          </div>

          <div className="info-card">
            <FiMapPin />
            <h4>Shipping Address</h4>

            <p>
              {order.address.city}
              <br />
              {order.address.state}
              <br />
              {order.address.pincode}
            </p>

          </div>

          <div className="info-card">
            <FiCreditCard />
            <h4>Payment</h4>
            <p>{order.payment_method}</p>
          </div>

          <div className="info-card">
            <FiPackage />
            <h4>Total Paid</h4>
            <p>₹{order.total_price}</p>
          </div>

        </section>



        <section className="timeline-section">

          <h2>Order Journey</h2>

          <div className="timeline">

            <div className="timeline-item active">
              <div className="timeline-icon">
                <FiCheckCircle />
              </div>

              <h4>Confirmed</h4>
              <p>Order received</p>
            </div>

            <div className="timeline-line"></div>

            <div className="timeline-item">
              <div className="timeline-icon">🏺</div>

              <h4>Preparing</h4>
              <p>Handmade with care</p>
            </div>

            <div className="timeline-line"></div>

            <div className="timeline-item">
              <div className="timeline-icon">
                <FiTruck />
              </div>

              <h4>Shipped</h4>
              <p>On the way</p>
            </div>

            <div className="timeline-line"></div>

            <div className="timeline-item">
              <div className="timeline-icon">
                <FiHome />
              </div>

              <h4>Delivered</h4>
              <p>Enjoy!</p>
            </div>

          </div>

        </section>



        <section className="delivery-box">

          <FiGift />

          <div>

            <h3>Estimated Delivery : 3 - 5 Days</h3>

            <p>
              We will notify you through SMS and Email once your order is shipped.
            </p>

          </div>

        </section>



        <section className="features-grid">

          <div className="feature-card">
            <FiShield />
            <h4>Secure Checkout</h4>
            <p>Protected Payment</p>
          </div>

          <div className="feature-card">
            <FiTruck />
            <h4>Fast Delivery</h4>
            <p>Safe Packaging</p>
          </div>

          <div className="feature-card">
            <FiRefreshCw />
            <h4>Easy Returns</h4>
            <p>Simple Return Policy</p>
          </div>

          <div className="feature-card">
            <FiHeadphones />
            <h4>Support</h4>
            <p>24×7 Customer Support</p>
          </div>

        </section>



        <section className="success-buttons">

          <Link
            to="/shop"
            className="continue-btn"
          >
            <FiShoppingBag />
            Continue Shopping
          </Link>

          <Link
            to="/orders"
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