import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import api from "../api/axios";
import { loadRazorpay } from "../utils/loadRazorpay";

import {
  FiPlus,
  FiCreditCard,
  FiTruck,
  FiCheckCircle,
  FiLock,
} from "react-icons/fi";

import {
  SiVisa,
  SiMastercard,
  SiGooglepay,
  SiPaytm,
  SiPhonepe,
} from "react-icons/si";

import { FaMoneyBillWave } from "react-icons/fa";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import "./styles/Checkout.css";

const EMPTY_FORM = {
  full_name: "",
  phone_number: "",
  address_line: "",
  city: "",
  state: "",
  pincode: "",
  address_type: "Home",
  is_default: false,
};

function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

  const buyNowData = location.state;

  const [cart, setCart] = useState({
    cart_items: [],
    total_items: 0,
    total_original_price: 0,
    total_discount_price: 0,
    total_savings: 0,
  });

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState("COD");

  const [loading, setLoading] = useState(true);

  const [placingOrder, setPlacingOrder] = useState(false);

  const [processingPayment, setProcessingPayment] = useState(false);

  const [showOverlay, setShowOverlay] = useState(false);

  const [loadingText, setLoadingText] = useState(
    "Preparing your ClayWare order..."
  );

  const [showForm, setShowForm] = useState(false);

  // Missing in your code
  const [showAddressList, setShowAddressList] = useState(false);

  const [formData, setFormData] = useState(EMPTY_FORM);

  // =====================================
  // FETCH CART
  // =====================================

  const fetchCart = async () => {
    try {
      const res = await api.get("/user/viewcart/");
      setCart(res.data);
    } catch (err) {
      console.error("Cart Error:", err);
    }
  };

  // =====================================
  // FETCH ADDRESSES
  // =====================================

  const fetchAddresses = async () => {
    try {
      const res = await api.get("/user/user-addresses/");

      const list = res.data.addresses || [];

      setAddresses(list);

      const defaultAddress =
        list.find((item) => item.is_default) || list[0];

      if (defaultAddress) {
        setSelectedAddress(defaultAddress.address_id);
      }
    } catch (err) {
      console.error("Address Error:", err);
    }
  };

  // =====================================
  // INITIAL LOAD
  // =====================================

  useEffect(() => {
    const loadData = async () => {
      try {
        if (buyNowData?.buyNow) {
          setCart({
            cart_items: [
              {
                cart_item_id: "buy-now",
                product_name: buyNowData.product_name,
                product_image: buyNowData.product_image,
                quantity: buyNowData.quantity,
                variant_capacity:
                  buyNowData.variant_capacity || "Standard",
                subtotal_discount_price:
                  buyNowData.price * buyNowData.quantity,
              },
            ],

            total_items: buyNowData.quantity,

            total_original_price:
              buyNowData.price * buyNowData.quantity,

            total_discount_price:
              buyNowData.price * buyNowData.quantity,

            total_savings: 0,
          });

          await fetchAddresses();
        } else {
          await Promise.all([
            fetchCart(),
            fetchAddresses(),
          ]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);
    // =====================================
  // HANDLE FORM INPUT
  // =====================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };


  // =====================================
  // ADD NEW ADDRESS
  // =====================================

  const addAddress = async () => {
    try {
      const res = await api.post(
        "/user/add-address/",
        formData
      );

      alert("Address added successfully");

      setShowForm(false);

      setFormData(EMPTY_FORM);

      await fetchAddresses();

      setSelectedAddress(
        res.data.address_id
      );

    } catch (err) {
      console.error(
        "Add Address Error:",
        err
      );
    }
  };


  // =====================================
  // CREATE ORDER
  // =====================================

  const placeOrder = async () => {

    if (!selectedAddress) {
      alert("Please select delivery address");
      return;
    }


    setPlacingOrder(true);
    setShowOverlay(true);


    try {

      setLoadingText(
        "Creating your ClayWare order..."
      );


      const payload = {

        address_id: selectedAddress,

        payment_method: paymentMethod,


        buy_now: buyNowData?.buyNow || false,


        buy_now_product: buyNowData?.buyNow
          ? {
              product_id: buyNowData.product_id,
              quantity: buyNowData.quantity,
              variant_id:
                buyNowData.variant_id,
            }
          : null,

      };


      const res = await api.post(
        "/order/checkout/",
        payload
      );


      const order = res.data;


      if (paymentMethod === "COD") {

        setLoadingText(
          "Order placed successfully..."
        );


        setTimeout(() => {

          navigate(
            `/order-success/${order.order_id}`
          );

        }, 1500);


      } else {

        await handleRazorpayPayment(
          order.order_id
        );

      }


    } catch (err) {

      console.error(
        "Order Error:",
        err
      );

      alert(
        "Unable to place order"
      );

      setShowOverlay(false);

    } finally {

      setPlacingOrder(false);

    }

  };
    // =====================================
  // RAZORPAY PAYMENT
  // =====================================

  const handleRazorpayPayment = async (orderId) => {

    try {

      setProcessingPayment(true);

      setLoadingText(
        "Opening secure payment..."
      );


      // Create Razorpay order

      const razorpayRes = await api.post(
        "/payments/create-razorpay-order/",
        {
          order_id: orderId,
        }
      );


      const data = razorpayRes.data;


      const loaded = await loadRazorpay();


      if (!loaded) {

        alert(
          "Razorpay failed to load"
        );

        return;

      }



      const options = {

        key: data.key,

        amount: data.amount,

        currency: "INR",

        name: "ClayWare",

        description:
          "ClayWare Order Payment",


        order_id:
          data.razorpay_order_id,


        handler: async function (
          response
        ) {


          try {

            setLoadingText(
              "Verifying payment..."
            );


            const verifyRes =
              await api.post(
                "/payments/verify-payment/",
                {

                  razorpay_order_id:
                    response.razorpay_order_id,


                  razorpay_payment_id:
                    response.razorpay_payment_id,


                  razorpay_signature:
                    response.razorpay_signature,


                  order_id: orderId,

                }
              );


            if (
              verifyRes.data.success
            ) {


              setLoadingText(
                "Payment successful..."
              );


              setTimeout(() => {

                navigate(
                  `/order-success/${orderId}`
                );

              },1500);


            }


          } catch(error){

            console.error(
              "Payment Verification Error:",
              error
            );

            alert(
              "Payment verification failed"
            );

          }

        },


        prefill: {

          name:
            selectedAddress?.full_name || "",

          contact:
            selectedAddress?.phone_number || "",

        },


        theme: {

          color:"#b86b3c"

        }

      };



      const razorpay =
        new window.Razorpay(options);


      razorpay.open();



      razorpay.on(
        "payment.failed",
        function(response){

          console.log(
            response.error
          );

          alert(
            "Payment failed"
          );

        }
      );


    } catch(error){

      console.error(
        "Razorpay Error:",
        error
      );

      alert(
        "Unable to start payment"
      );


    } finally {

      setProcessingPayment(false);

    }

  };



  // =====================================
  // TOTAL PRICE
  // =====================================


  const finalAmount =
    cart.total_discount_price;



  // =====================================
  // LOADING SCREEN
  // =====================================

  if(loading){

    return (

      <>

        <Navbar />


        <div className="checkout-loader">

          <FiLock />

          <h3>
            Loading Checkout...
          </h3>

        </div>


        <Footer />

      </>

    );

  }
    return (

    <>

      <Navbar />


      <div className="checkout-page">


        <div className="checkout-container">


          {/* =========================
              LEFT SECTION
          ========================== */}


          <div className="checkout-left">



            {/* DELIVERY ADDRESS */}

            <div className="checkout-card">


              <div className="checkout-title">

                <FiTruck />

                <h2>
                  Delivery Address
                </h2>


              </div>



              <button
                className="add-address-btn"
                onClick={() =>
                  setShowForm(!showForm)
                }
              >

                <FiPlus />

                Add New Address

              </button>




              {/* ADDRESS LIST */}


              <div className="address-list">


                {addresses.map((address)=>(


                  <div
                    key={address.address_id}

                    className={
                      selectedAddress ===
                      address.address_id

                      ? "address-box active"

                      : "address-box"
                    }


                    onClick={() =>
                      setSelectedAddress(
                        address.address_id
                      )
                    }

                  >


                    <input

                      type="radio"

                      checked={
                        selectedAddress ===
                        address.address_id
                      }

                      readOnly

                    />



                    <div>


                      <h4>

                        {address.full_name}

                      </h4>


                      <p>

                        {address.address_line}

                      </p>


                      <p>

                        {address.city},
                        {address.state}
                        -
                        {address.pincode}

                      </p>


                      <p>

                        Phone:
                        {address.phone_number}

                      </p>


                    </div>



                  </div>


                ))}


              </div>





              {/* ADD ADDRESS FORM */}



              {showForm && (

                <div className="address-form">


                  {Object.keys(EMPTY_FORM)
                  .filter(
                    key =>
                    key !== "is_default"
                  )
                  .map((field)=>(


                    <input

                      key={field}

                      name={field}

                      value={
                        formData[field]
                      }

                      placeholder={
                        field.replace("_"," ")
                      }

                      onChange={
                        handleChange
                      }

                    />


                  ))}



                  <label>


                    <input

                      type="checkbox"

                      name="is_default"

                      checked={
                        formData.is_default
                      }

                      onChange={
                        handleChange
                      }

                    />


                    Set as default


                  </label>



                  <button

                    onClick={addAddress}

                  >

                    Save Address

                  </button>


                </div>

              )}



            </div>





            {/* PAYMENT METHOD */}



            <div className="checkout-card">


              <div className="checkout-title">


                <FiCreditCard />


                <h2>
                  Payment Method
                </h2>


              </div>




              <div className="payment-options">



                <label
                  className={
                    paymentMethod==="COD"
                    ? "payment-box active"
                    : "payment-box"
                  }
                >


                  <input

                    type="radio"

                    value="COD"

                    checked={
                      paymentMethod==="COD"
                    }

                    onChange={
                      e =>
                      setPaymentMethod(
                        e.target.value
                      )
                    }

                  />


                  <FaMoneyBillWave />


                  Cash On Delivery


                </label>





                <label

                  className={
                    paymentMethod==="RAZORPAY"
                    ? "payment-box active"
                    : "payment-box"
                  }

                >


                  <input

                    type="radio"

                    value="RAZORPAY"

                    checked={
                      paymentMethod==="RAZORPAY"
                    }

                    onChange={
                      e =>
                      setPaymentMethod(
                        e.target.value
                      )
                    }

                  />



                  <FiCreditCard />

                  Online Payment



                </label>



              </div>





              <div className="payment-icons">


                <SiVisa />

                <SiMastercard />

                <SiGooglepay />

                <SiPaytm />

                <SiPhonepe />


              </div>



            </div>



          </div>

                    {/* =========================
              RIGHT SECTION
          ========================== */}


          <div className="checkout-right">


            <div className="checkout-card summary-card">


              <div className="checkout-title">


                <FiCheckCircle />


                <h2>
                  Order Summary
                </h2>


              </div>





              {/* PRODUCTS */}



              <div className="checkout-products">


                {cart.cart_items.map((item)=>(


                  <div
                    className="checkout-product"
                    key={
                      item.cart_item_id
                    }
                  >



                    <img

                      src={
                        item.product_image
                      }

                      alt={
                        item.product_name
                      }

                    />



                    <div className="product-info">


                      <h4>

                        {item.product_name}

                      </h4>



                      {
                        item.variant_capacity &&

                        <p>

                          Size:
                          {
                            item.variant_capacity
                          }

                        </p>

                      }



                      <p>

                        Qty:
                        {
                          item.quantity
                        }

                      </p>



                    </div>




                    <strong>


                      ₹
                      {
                        item.subtotal_discount_price
                      }


                    </strong>



                  </div>



                ))}



              </div>





              {/* PRICE DETAILS */}



              <div className="price-details">



                <div>

                  <span>
                    Total Items
                  </span>


                  <span>

                    {
                      cart.total_items
                    }

                  </span>


                </div>





                <div>

                  <span>
                    Price
                  </span>


                  <span>

                    ₹
                    {
                      cart.total_original_price
                    }

                  </span>


                </div>





                <div>

                  <span>
                    Discount
                  </span>


                  <span className="discount">


                    -₹
                    {
                      cart.total_savings
                    }


                  </span>


                </div>





                <div className="final-price">


                  <span>

                    Total Amount

                  </span>


                  <span>

                    ₹
                    {
                      finalAmount
                    }

                  </span>


                </div>



              </div>





              {/* PLACE ORDER BUTTON */}



              <button

                className="place-order-btn"


                disabled={
                  placingOrder ||
                  processingPayment
                }


                onClick={
                  placeOrder
                }

              >


                {
                  placingOrder

                  ? "Processing..."

                  : paymentMethod==="COD"

                  ? "Place Order"

                  : "Pay Now"

                }


              </button>





              <div className="secure-payment">


                <FiLock />


                Secure checkout powered by ClayWare



              </div>



            </div>



          </div>



        </div>



      </div>





      {/* =========================
          PAYMENT OVERLAY
      ========================== */}



      {showOverlay && (


        <div className="payment-overlay">



          <div className="clay-loader">



            <div className="clay-circle">


            </div>




            <h3>

              {loadingText}

            </h3>



            <p>

              Please don't refresh or close this page

            </p>



          </div>



        </div>


      )}





      <Footer />


    </>

  );

}


export default Checkout;