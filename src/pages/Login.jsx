import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import {
    loginUser,
    checkPhone,
    sendOTP,
    verifyOTP,
} from "../services/authService";

import "./styles/login.css";

function Login() {

    const navigate = useNavigate();

    // ============================================
    // UI STATE
    // ============================================

    const [authorizedLogin, setAuthorizedLogin] = useState(false);

    // Customer Login Method
    // otp | password

    const [loginMethod, setLoginMethod] = useState("otp");

    // ============================================
    // CUSTOMER
    // ============================================

    const [customerIdentifier, setCustomerIdentifier] = useState("");

    const [customerPassword, setCustomerPassword] = useState("");

    const [otp, setOtp] = useState("");

    const [otpSent, setOtpSent] = useState(false);

    // ============================================
    // AUTHORIZED LOGIN
    // ============================================

    const [identifier, setIdentifier] = useState("");

    const [password, setPassword] = useState("");

    // ============================================
    // COMMON
    // ============================================

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    // ============================================
    // AUTO LOGIN
    // ============================================

    useEffect(() => {

        const token = localStorage.getItem("token");

        const role = localStorage.getItem("role");

        if (token && role) {

            redirectUser(role);

        }

    }, []);

    // ============================================
    // REDIRECT
    // ============================================

    const redirectUser = (role) => {

        switch (role) {

            case "user":
                navigate("/shop", { replace: true });
                break;

            case "seller":
                navigate("/seller-dashboard", { replace: true });
                break;

            case "delivery_partner":
                navigate("/delivery-dashboard", { replace: true });
                break;

            case "marketing":
                navigate("/marketing-dashboard", { replace: true });
                break;

            case "admin":
                navigate("/admin-dashboard", { replace: true });
                break;

            default:
                navigate("/");
        }
    };

    // ============================================
    // SAVE LOGIN
    // ============================================

    const saveLogin = (response) => {

        localStorage.setItem("token", response.token);

        localStorage.setItem("role", response.role);

        localStorage.setItem("email", response.email || "");

        localStorage.setItem(
            "phone_number",
            response.phone_number || ""
        );

        redirectUser(response.role);
    };
        // ============================================
    // CUSTOMER PASSWORD LOGIN
    // ============================================

    const handleCustomerLogin = async (e) => {

        e.preventDefault();

        setLoading(true);
        setError("");

        try {

            const response = await loginUser({

                identifier: customerIdentifier,

                password: customerPassword,

            });

            if (response.role !== "user") {

                setError("Please use Authorized Login.");

                return;

            }

            saveLogin(response);

        }

        catch (err) {

            setError(

                err.response?.data?.message ||

                err.response?.data?.detail ||

                "Invalid credentials."

            );

        }

        finally {

            setLoading(false);

        }

    };

    // ============================================
    // SEND OTP
    // ============================================

    const handleSendOTP = async () => {

        if (!customerIdentifier.trim()) {

            setError("Enter your mobile number.");

            return;

        }

        setLoading(true);

        setError("");

        try {

            await checkPhone({

                phone_number: customerIdentifier,

            });

            await sendOTP({

                phone_number: customerIdentifier,

            });

            setOtpSent(true);

        }

        catch (err) {

            setError(

                err.response?.data?.message ||

                "Unable to send OTP."

            );

        }

        finally {

            setLoading(false);

        }

    };

    // ============================================
    // VERIFY OTP
    // ============================================

    const handleVerifyOTP = async () => {

        if (!otp.trim()) {

            setError("Enter OTP.");

            return;

        }

        setLoading(true);

        setError("");

        try {

            const response = await verifyOTP({

                phone_number: customerIdentifier,

                otp,

            });

            saveLogin(response);

        }

        catch (err) {

            setError(

                err.response?.data?.message ||

                "Invalid OTP."

            );

        }

        finally {

            setLoading(false);

        }

    };

    // ============================================
    // AUTHORIZED LOGIN
    // ============================================

    const handleAuthorizedLogin = async (e) => {

        e.preventDefault();

        setLoading(true);

        setError("");

        try {

            const response = await loginUser({

                identifier,

                password,

            });

            if (response.role === "user") {

                setError("Customers should use Customer Login.");

                return;

            }

            saveLogin(response);

        }

        catch (err) {

            setError(

                err.response?.data?.message ||

                err.response?.data?.detail ||

                "Invalid credentials."

            );

        }

        finally {

            setLoading(false);

        }

    };
    return (
    <>
        <Navbar />

        <div className="login-page">

            <div className="login-card">

                <h2>
                    {authorizedLogin
                        ? "🔒 Authorized Login"
                        : "👋 Welcome Back"}
                </h2>

                <p className="login-subtitle">
                    {authorizedLogin
                        ? "Seller • Delivery Partner • Marketing • Admin"
                        : "Login to your ClayWare account"}
                </p>

                {error && (
                    <div className="login-error">
                        {error}
                    </div>
                )}

                {/* ==========================
                    CUSTOMER LOGIN
                =========================== */}
                {!authorizedLogin && (
    <>

        <div className="login-tabs">

            <button
                type="button"
                className={loginMethod === "otp" ? "tab-btn active" : "tab-btn"}
                onClick={() => {
                    setLoginMethod("otp");
                    setOtpSent(false);
                    setOtp("");
                    setError("");
                }}
            >
                OTP Login
            </button>

            <button
                type="button"
                className={loginMethod === "password" ? "tab-btn active" : "tab-btn"}
                onClick={() => {
                    setLoginMethod("password");
                    setError("");
                }}
            >
                Password Login
            </button>

        </div>

        <div className="input-group">

            <label>Mobile Number</label>

            <input
                type="text"
                placeholder="Enter Mobile Number"
                value={customerIdentifier}
                onChange={(e) => setCustomerIdentifier(e.target.value)}
            />

        </div>

        {loginMethod === "password" && (

            <form onSubmit={handleCustomerLogin}>

                <div className="input-group">

                    <label>Password</label>

                    <input
                        type="password"
                        placeholder="Enter Password"
                        value={customerPassword}
                        onChange={(e) =>
                            setCustomerPassword(e.target.value)
                        }
                    />

                </div>

                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>

            </form>

        )}

        {loginMethod === "otp" && (

            <>

                {!otpSent ? (

                    <button
                        type="button"
                        className="otp-btn"
                        onClick={handleSendOTP}
                    >
                        {loading ? "Sending OTP..." : "Send OTP"}
                    </button>

                ) : (

                    <>

                        <div className="input-group">

                            <label>Enter OTP</label>

                            <input
                                type="text"
                                placeholder="Enter 6-digit OTP"
                                value={otp}
                                onChange={(e) =>
                                    setOtp(e.target.value)
                                }
                            />

                        </div>

                        <button
                            type="button"
                            className="otp-btn"
                            onClick={handleVerifyOTP}
                        >
                            {loading ? "Verifying..." : "Verify OTP"}
                        </button>

                    </>

                )}

            </>

        )}

        <div className="login-divider">
            <span>Authorized Users</span>
        </div>

        <button
            type="button"
            className="secondary-btn"
            onClick={() => setAuthorizedLogin(true)}
        >
            Seller / Delivery / Marketing / Admin Login
        </button>

        <p className="register-link">
            Don't have an account?
            <span onClick={() => navigate("/register")}>
                Create Account
            </span>
        </p>

    </>
)}

                                {authorizedLogin && (

                    <form onSubmit={handleAuthorizedLogin}>

                        <button
                            type="button"
                            className="back-btn"
                            onClick={() => {

                                setAuthorizedLogin(false);
                                setError("");

                            }}
                        >
                            ← Back to Customer Login
                        </button>

                        <div className="input-group">

                            <label>Email or Mobile Number</label>

                            <input
                                type="text"
                                placeholder="Email or Mobile Number"
                                value={identifier}
                                onChange={(e) =>
                                    setIdentifier(e.target.value)
                                }
                                required
                            />

                        </div>

                        <div className="input-group">

                            <label>Password</label>

                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                required
                            />

                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Logging in..."
                                : "Login"}
                        </button>

                    </form>

                )}

            </div>

        </div>

        <Footer />

    </>

    );

}

export default Login;