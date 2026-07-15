import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import {
    verifyOTP,
    sendOTP,
} from "../services/authService";




function VerifyOTP() {

    const navigate = useNavigate();

    const location = useLocation();


    const phone_number =
        location.state?.phone_number;


    const is_new_user =
        location.state?.is_new_user;



    const [otp, setOtp] = useState("");

    const [loading, setLoading] = useState(false);

    const [resendLoading, setResendLoading] = useState(false);

    const [error, setError] = useState("");

    const [message, setMessage] = useState("");



    // ==========================================
    // VERIFY OTP
    // ==========================================

    const handleVerifyOTP = async (e) => {

        e.preventDefault();


        if (!otp) {

            setError(
                "Please enter OTP"
            );

            return;

        }


        setLoading(true);
        setError("");
        setMessage("");



        try {


            const response = await verifyOTP({

                phone_number,

                otp,

            });



            console.log(
                "OTP Verify Response",
                response
            );



            // Existing User

            if(response.registered === true){


                localStorage.setItem(
                    "token",
                    response.token
                );


                localStorage.setItem(
                    "role",
                    response.role
                );


                localStorage.setItem(
                    "phone_number",
                    response.phone_number
                );


                localStorage.setItem(
                    "email",
                    response.email || ""
                );



                if(response.role === "user"){

                    navigate(
                        "/shop",
                        {
                            replace:true
                        }
                    );

                }
                else{

                    navigate(
                        "/",
                        {
                            replace:true
                        }
                    );

                }


            }


            // New User

            else{


                navigate(
                    "/register",
                    {
                        state:{
                            phone_number,
                            otp_verified:true
                        }
                    }
                );


            }



        }


        catch(err){


            setError(

                err.response?.data?.message ||

                "Invalid OTP"

            );


        }


        finally{

            setLoading(false);

        }


    };



    // ==========================================
    // RESEND OTP
    // ==========================================

    const handleResendOTP = async () => {


        setResendLoading(true);

        setError("");

        setMessage("");



        try{


            await sendOTP({

                phone_number

            });


            setMessage(
                "OTP sent again"
            );


        }

        catch(err){


            setError(
                "Unable to resend OTP"
            );


        }


        finally{

            setResendLoading(false);

        }

    };





    return (

        <>

        <Navbar />


        <div className="login-page">


            <form
                className="login-card"
                onSubmit={handleVerifyOTP}
            >


                <h2>
                    Verify OTP 🔐
                </h2>



                <p className="login-subtitle">

                    OTP sent to
                    <br />

                    <b>
                        {phone_number}
                    </b>

                </p>




                {
                    error &&

                    <div className="login-error">

                        {error}

                    </div>
                }




                {
                    message &&

                    <div className="login-success">

                        {message}

                    </div>
                }





                <div className="input-group">


                    <label>
                        Enter OTP
                    </label>


                    <input

                        type="text"

                        placeholder="Enter 6 digit OTP"

                        value={otp}

                        maxLength="6"

                        onChange={(e)=>{

                            setOtp(
                                e.target.value.replace(/\D/g,"")
                            );

                        }}

                        required

                    />


                </div>





                <button

                    type="submit"

                    disabled={loading}

                >

                    {
                        loading

                        ?
                        "Verifying..."

                        :
                        "Verify OTP"
                    }


                </button>





                <button

                    type="button"

                    className="secondary-btn"

                    onClick={handleResendOTP}

                    disabled={resendLoading}

                >

                    {
                        resendLoading

                        ?
                        "Sending..."

                        :
                        "Resend OTP"
                    }


                </button>




            </form>


        </div>


        <Footer />


        </>

    );

}


export default VerifyOTP;