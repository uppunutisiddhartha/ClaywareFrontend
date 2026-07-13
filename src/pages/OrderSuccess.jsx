import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

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

  const location = useLocation();


  const [order,setOrder] = useState(null);

  const [loading,setLoading] = useState(true);

  const [error,setError] = useState(null);



  useEffect(()=>{


    const fetchOrder = async()=>{


      try{


        const orderId = location.state?.orderId;



        if(!orderId){

          setError(
            "Order details not found."
          );

          setLoading(false);

          return;

        }



        const response = await api.get(
          `order/success/${orderId}/`
        );



        setOrder(
          response.data.order
        );



      }
      catch(err){


        console.log(err);


        setError(
          "Unable to load order details."
        );


      }
      finally{

        setLoading(false);

      }


    };



    fetchOrder();



  },[location]);





  if(loading){

    return(

      <>

      <Navbar/>


      <div className="order-success-page">

        <h2>
          Loading order details...
        </h2>

      </div>


      <Footer/>


      </>

    );

  }





  if(error || !order){

    return(

      <>

      <Navbar/>


      <div className="order-success-page">


        <h2>
          {error}
        </h2>


        <Link to="/shop">
          Continue Shopping
        </Link>


      </div>


      <Footer/>


      </>

    );

  }





  return (

    <>


    <Navbar/>


    <div className="order-success-page">



      {/* HERO */}


      <section className="success-hero">


        <div className="success-circle">

          <FiCheckCircle/>

        </div>



        <h1>

          Order Placed Successfully!

        </h1>



        <p>

          Thank you for shopping with

          <strong>
            ClayWare.
          </strong>


          <br/>


          Your handcrafted products are now
          being prepared with care.


        </p>




        <div className="order-id-card">


          <span>
            Order ID
          </span>



          <h2>
            #CW{order.id}
          </h2>


        </div>


      </section>






      {/* DETAILS */}



      <section className="order-info-grid">



        <div className="info-card">

          <FiCalendar/>

          <h4>
            Order Date
          </h4>


          <p>

          {
            new Date(order.date)
            .toLocaleDateString(
              "en-IN"
            )
          }

          </p>


        </div>





        <div className="info-card">


          <FiMapPin/>


          <h4>
            Shipping Address
          </h4>


          <p>

          {order.address?.city},

          <br/>

          {order.address?.state}

          <br/>

          {order.address?.pincode}


          </p>


        </div>





        <div className="info-card">


          <FiCreditCard/>


          <h4>
            Payment
          </h4>


          <p>

          {
            order.payment_method
          }

          </p>


        </div>






        <div className="info-card">


          <FiPackage/>


          <h4>
            Total Paid
          </h4>


          <p>

          ₹{order.total_price}


          </p>


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

              <FiCheckCircle/>

            </div>


            <h4>
              Confirmed
            </h4>


            <p>
              Order received
            </p>


          </div>





          <div className="timeline-line"/>




          <div className="timeline-item">


            <div className="timeline-icon">

              🏺

            </div>


            <h4>
              Preparing
            </h4>


            <p>
              Handmade with care
            </p>


          </div>





          <div className="timeline-line"/>




          <div className="timeline-item">


            <div className="timeline-icon">

              <FiTruck/>

            </div>


            <h4>
              Shipped
            </h4>


            <p>
              On the way
            </p>


          </div>





          <div className="timeline-line"/>




          <div className="timeline-item">


            <div className="timeline-icon">

              <FiHome/>

            </div>


            <h4>
              Delivered
            </h4>


            <p>
              Enjoy!
            </p>


          </div>



        </div>


      </section>







      {/* DELIVERY */}



      <section className="delivery-box">


        <FiGift/>



        <div>


          <h3>

            Estimated Delivery : 3 - 5 Days

          </h3>



          <p>

            We will notify you by SMS &
            Email once your package is shipped.


          </p>


        </div>



      </section>







      {/* FEATURES */}



      <section className="features-grid">



        <div className="feature-card">

          <FiShield/>

          <h4>
            Secure Checkout
          </h4>

          <p>
            Protected payment &
            encrypted transactions.
          </p>


        </div>




        <div className="feature-card">

          <FiTruck/>

          <h4>
            Fast Delivery
          </h4>

          <p>
            Carefully packed &
            delivered safely.
          </p>


        </div>





        <div className="feature-card">


          <FiRefreshCw/>


          <h4>
            Easy Returns
          </h4>


          <p>
            Hassle-free replacement.
          </p>


        </div>





        <div className="feature-card">


          <FiHeadphones/>


          <h4>
            Support
          </h4>


          <p>
            Our team is always
            available to help.
          </p>


        </div>



      </section>






      {/* BUTTONS */}



      <section className="success-buttons">



        <Link
          to="/shop"
          className="continue-btn"
        >

          <FiShoppingBag/>

          Continue Shopping


        </Link>




        <Link
          to="/orders"
          className="track-btn"
        >

          Track Order

          <FiArrowRight/>


        </Link>



      </section>





    </div>



    <Footer/>


    </>

  );

}



export default OrderSuccess;