import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { loginUser } from "../services/authService";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import "./styles/login.css";


function Login() {

    const navigate = useNavigate();


    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");

    const [error, setError] = useState("");

    const [loading, setLoading] = useState(false);



    // Redirect already logged-in users

    useEffect(() => {

        const token = localStorage.getItem("token");

        const role = localStorage.getItem("role");


        if (token && role) {

            redirectUser(role);

        }

    }, []);



    const redirectUser = (role) => {


        switch(role){


            case "user":

                navigate("/shop", {replace:true});

                break;


            case "seller":

                navigate("/seller-dashboard", {replace:true});

                break;


            case "delivery_partner":

                navigate("/delivery-dashboard", {replace:true});

                break;


            case "admin":

                navigate("/admin-dashboard", {replace:true});

                break;


            default:

                navigate("/");

        }


    };





    const handleSubmit = async (e)=>{


        e.preventDefault();


        setError("");

        setLoading(true);



        try{


            const response = await loginUser({

                email,

                password

            });



            console.log(
                "Login Success:",
                response
            );



            /*
              Adjust according to your API response

              Example:

              {
                token:"",
                role:"user",
                email:""
              }

            */


            const token = response.token;

            const role = response.role;



            if(!token){

                throw new Error(
                    "Token not received"
                );

            }



            localStorage.setItem(
                "token",
                token
            );


            localStorage.setItem(
                "role",
                role
            );


            localStorage.setItem(
                "email",
                response.email || email
            );




            redirectUser(role);



        }

        catch(err){


            console.log(
                err.response?.data
            );


            setError(

                err.response?.data?.message ||

                err.response?.data?.detail ||

                "Invalid email or password"

            );


        }

        finally{


            setLoading(false);


        }


    };





    return (

        <>


        <Navbar />


        <div className="login-page">


            <form
                className="login-card"
                onSubmit={handleSubmit}
            >


                <h2>

                    Welcome Back 👋

                </h2>


                <p className="login-subtitle">

                    Login to your ClayWare account

                </p>




                {
                    error &&

                    <div className="login-error">

                        {error}

                    </div>
                }




                <div className="input-group">


                    <label>Email</label>


                    <input

                        type="email"

                        placeholder="Enter your email"

                        value={email}

                        onChange={(e)=>
                            setEmail(e.target.value)
                        }

                        required

                    />


                </div>





                <div className="input-group">


                    <label>Password</label>


                    <input

                        type="password"

                        placeholder="Enter your password"

                        value={password}

                        onChange={(e)=>
                            setPassword(e.target.value)
                        }

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
                        "Logging in..."
                        :
                        "Login"
                    }


                </button>




                <p className="register-link">


                    Don't have an account?


                    <span
                        onClick={()=>
                            navigate("/register")
                        }
                    >

                        Create Account

                    </span>


                </p>



            </form>


        </div>


        <Footer />


        </>

    );

}


export default Login;