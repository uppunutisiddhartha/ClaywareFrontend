import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { checkPhone, sendOTP, verifyOTP } from "../services/authService";
import "./styles/login.css";

function Login() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // ============================================
  // STATE
  // ============================================
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [countryCode, setCountryCode] = useState("+91");

  // ============================================
  // 3D CANVAS BACKGROUND
  // ============================================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationId;
    let time = 0;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // ============================================
    // DRAW POTTERY WORKSHOP
    // ============================================
    const drawWorkshop = () => {
      const w = canvas.width;
      const h = canvas.height;
      
      // Background - earthy gradient
      const gradient = ctx.createRadialGradient(w * 0.3, h * 0.3, 0, w * 0.5, h * 0.5, w * 0.9);
      gradient.addColorStop(0, "#faf7f2");
      gradient.addColorStop(0.3, "#e8d9c5");
      gradient.addColorStop(0.6, "#d4bfa8");
      gradient.addColorStop(1, "#8b7355");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      // Temple pillars
      const drawPillar = (x, y, width, height) => {
        const pillarGrad = ctx.createLinearGradient(x, y, x + width, y);
        pillarGrad.addColorStop(0, "#d4bfa8");
        pillarGrad.addColorStop(0.3, "#f0e6d8");
        pillarGrad.addColorStop(0.7, "#f0e6d8");
        pillarGrad.addColorStop(1, "#d4bfa8");
        ctx.fillStyle = pillarGrad;
        ctx.fillRect(x, y, width, height);
        
        ctx.strokeStyle = "#b8a088";
        ctx.lineWidth = 1;
        for (let i = 0; i < 10; i++) {
          const yy = y + 40 + i * (height - 80) / 9;
          ctx.beginPath();
          ctx.arc(x + width/2, yy, 8, 0, Math.PI * 2);
          ctx.stroke();
        }
      };

      const pillarSpacing = w / 6;
      for (let i = 0; i < 5; i++) {
        const x = i * pillarSpacing + pillarSpacing * 0.3;
        drawPillar(x, h * 0.1, 20, h * 0.8);
      }

      // Wooden shelves with products
      const drawShelf = (y, items) => {
        ctx.fillStyle = "#8b7355";
        ctx.shadowColor = "rgba(0,0,0,0.2)";
        ctx.shadowBlur = 10;
        ctx.fillRect(w * 0.1, y, w * 0.8, 6);
        ctx.shadowBlur = 0;
        
        ctx.strokeStyle = "#6b5a45";
        ctx.lineWidth = 1;
        for (let i = 0; i < 8; i++) {
          const x = w * 0.1 + i * (w * 0.8 / 8);
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + 8, y + 6);
          ctx.stroke();
        }

        items.forEach((item, index) => {
          const x = w * 0.15 + index * (w * 0.7 / items.length);
          const size = 18 + Math.sin(time + index) * 2;
          
          ctx.shadowColor = "rgba(0,0,0,0.2)";
          ctx.shadowBlur = 8;
          ctx.fillStyle = "#c8622a";
          
          if (item === "pot") {
            ctx.beginPath();
            ctx.ellipse(x, y - size * 0.6, size * 0.5, size * 0.35, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(x - size * 0.25, y - size * 0.95, size * 0.5, size * 0.35);
            ctx.beginPath();
            ctx.ellipse(x, y - size * 0.95, size * 0.35, size * 0.12, 0, 0, Math.PI * 2);
            ctx.fill();
          } else if (item === "diya") {
            ctx.beginPath();
            ctx.ellipse(x, y - size * 0.25, size * 0.25, size * 0.12, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(x - size * 0.04, y - size * 0.4, size * 0.08, size * 0.15);
            ctx.fillStyle = "#e98745";
            const flameH = 6 + Math.sin(time * 2 + index) * 2;
            ctx.beginPath();
            ctx.moveTo(x, y - size * 0.4 - flameH);
            ctx.quadraticCurveTo(x - 4, y - size * 0.32, x, y - size * 0.25);
            ctx.quadraticCurveTo(x + 4, y - size * 0.32, x, y - size * 0.4 - flameH);
            ctx.fill();
          } else if (item === "cup") {
            ctx.fillRect(x - size * 0.25, y - size * 0.7, size * 0.5, size * 0.45);
            ctx.beginPath();
            ctx.ellipse(x, y - size * 0.7, size * 0.3, size * 0.08, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#c8622a";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x + size * 0.35, y - size * 0.5, size * 0.12, 0, Math.PI * 0.8);
            ctx.stroke();
          } else if (item === "vase") {
            ctx.beginPath();
            ctx.moveTo(x, y - size * 1.1);
            ctx.quadraticCurveTo(x - size * 0.35, y - size * 0.7, x - size * 0.25, y - size * 0.15);
            ctx.quadraticCurveTo(x, y, x + size * 0.25, y - size * 0.15);
            ctx.quadraticCurveTo(x + size * 0.35, y - size * 0.7, x, y - size * 1.1);
            ctx.fill();
          } else if (item === "plate") {
            ctx.beginPath();
            ctx.ellipse(x, y - size * 0.15, size * 0.4, size * 0.15, 0, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.shadowBlur = 0;
        });
      };

      const shelfItems = [
        ["pot", "diya", "cup", "vase"],
        ["plate", "pot", "diya", "cup"],
        ["vase", "plate", "pot", "diya"]
      ];

      shelfItems.forEach((items, idx) => {
        drawShelf(h * 0.25 + idx * h * 0.2, items);
      });

      // Potter's wheel
      const wx = w * 0.4;
      const wy = h * 0.72;
      const radius = 50;

      ctx.shadowColor = "rgba(0,0,0,0.3)";
      ctx.shadowBlur = 15;
      ctx.fillStyle = "#8b7355";
      ctx.beginPath();
      ctx.ellipse(wx, wy, radius, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 10;
      ctx.fillStyle = "#a08068";
      ctx.beginPath();
      ctx.ellipse(wx, wy - 4, radius * 0.85, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      const potH = 35 + Math.sin(time * 0.3) * 4;
      ctx.shadowBlur = 8;
      ctx.fillStyle = "#c8622a";
      ctx.beginPath();
      ctx.moveTo(wx - 18, wy - 4 - potH);
      ctx.quadraticCurveTo(wx - 26, wy - 4 - potH * 0.4, wx - 22, wy - 4 - potH * 0.1);
      ctx.quadraticCurveTo(wx - 12, wy - 4, wx + 12, wy - 4);
      ctx.quadraticCurveTo(wx + 22, wy - 4 - potH * 0.1, wx + 26, wy - 4 - potH * 0.4);
      ctx.quadraticCurveTo(wx + 18, wy - 4 - potH * 0.8, wx, wy - 4 - potH);
      ctx.fill();

      ctx.fillStyle = "#b85624";
      ctx.beginPath();
      ctx.ellipse(wx, wy - 4 - potH, 20, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Particles
      for (let i = 0; i < 25; i++) {
        const px = wx + Math.sin(time * 0.5 + i * 2.3) * 70 + i * 4;
        const py = wy - 20 - (i * 2.5 % 40) + Math.sin(time * 0.7 + i * 1.7) * 8;
        const s = 1 + Math.sin(time * 0.5 + i) * 0.5;
        
        ctx.shadowBlur = 3;
        ctx.fillStyle = `rgba(200, 98, 42, ${0.15 + Math.sin(time + i) * 0.05})`;
        ctx.beginPath();
        ctx.arc(px, py, s, 0, Math.PI * 2);
        ctx.fill();
      }

      // Lighting
      ctx.shadowBlur = 0;
      const lightGrad = ctx.createRadialGradient(
        w * 0.7, h * 0.15, 0,
        w * 0.7, h * 0.15, w * 0.6
      );
      lightGrad.addColorStop(0, "rgba(255, 220, 180, 0.06)");
      lightGrad.addColorStop(0.5, "rgba(255, 210, 170, 0.03)");
      lightGrad.addColorStop(1, "rgba(255, 200, 160, 0)");
      ctx.fillStyle = lightGrad;
      ctx.fillRect(0, 0, w, h);
    };

    const animate = () => {
      time += 0.01;
      drawWorkshop();
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  // ============================================
  // AUTO LOGIN
  // ============================================
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/shop", { replace: true });
    }
  }, [navigate]);

  // ============================================
  // RESEND COOLDOWN
  // ============================================
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // ============================================
  // VALIDATION FUNCTIONS
  // ============================================
  const validatePhoneNumber = (number) => {
    // Remove any non-digit characters except +
    const cleanNumber = number.replace(/[^\d+]/g, '');
    
    // Check if it's a valid Indian mobile number (10 digits starting with 6-9)
    const indianRegex = /^[6-9]\d{9}$/;
    
    // Check if it's a valid international number (country code + 7-15 digits)
    const internationalRegex = /^\+\d{1,3}\d{7,14}$/;
    
    if (cleanNumber.startsWith('+')) {
      return internationalRegex.test(cleanNumber);
    }
    
    return indianRegex.test(cleanNumber);
  };

  const formatPhoneNumber = (value) => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '');
    
    // Format as Indian mobile number with spaces
    if (cleaned.length <= 4) {
      return cleaned;
    } else if (cleaned.length <= 7) {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
    } else {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 10)}`;
    }
  };

  const getPhoneNumberError = (number) => {
    const cleanNumber = number.replace(/[^\d+]/g, '');
    
    if (!cleanNumber) {
      return "Mobile number is required";
    }
    
    if (cleanNumber.startsWith('+')) {
      if (cleanNumber.length < 10) {
        return "Please enter a valid international number";
      }
      if (!/^\+\d{1,3}\d{7,14}$/.test(cleanNumber)) {
        return "Please enter a valid phone number with country code";
      }
    } else {
      if (cleanNumber.length < 10) {
        return "Please enter a valid 10-digit mobile number";
      }
      if (!/^[6-9]\d{9}$/.test(cleanNumber)) {
        return "Mobile number must start with 6, 7, 8, or 9";
      }
    }
    
    return "";
  };

  // ============================================
  // SAVE LOGIN
  // ============================================
  const saveLogin = (response) => {
    localStorage.setItem("token", response.token);
    localStorage.setItem("email", response.email || "");
    localStorage.setItem("phone_number", response.phone_number || "");
    navigate("/shop", { replace: true });
  };

  // ============================================
  // SEND OTP
  // ============================================
  const handleSendOTP = async () => {
    const trimmedPhone = phoneNumber.trim();
    
    // Validate phone number
    const validationError = getPhoneNumberError(trimmedPhone);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Clean the phone number for API
      const cleanNumber = trimmedPhone.replace(/\s/g, '');
      await checkPhone({ phone_number: cleanNumber });
      await sendOTP({ phone_number: cleanNumber });
      setOtpSent(true);
      setResendCooldown(30);
      setSuccess("OTP sent successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message || 
        err.response?.data?.detail || 
        "Unable to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // VERIFY OTP
  // ============================================
  const handleVerifyOTP = async () => {
    const trimmedOtp = otp.trim();
    if (!trimmedOtp) {
      setError("Please enter the OTP");
      return;
    }

    if (trimmedOtp.length < 4) {
      setError("Please enter a valid 4-digit OTP");
      return;
    }

    setIsVerifying(true);
    setError("");
    setSuccess("");

    try {
      const cleanNumber = phoneNumber.trim().replace(/\s/g, '');
      const response = await verifyOTP({
        phone_number: cleanNumber,
        otp: trimmedOtp,
      });
      setSuccess("Verification successful!");
      setTimeout(() => {
        saveLogin(response);
      }, 1000);
    } catch (err) {
      setError(
        err.response?.data?.message || 
        err.response?.data?.detail || 
        "Invalid OTP. Please try again."
      );
    } finally {
      setIsVerifying(false);
    }
  };

  // ============================================
  // HANDLE PHONE INPUT CHANGE
  // ============================================
  const handlePhoneChange = (e) => {
    let value = e.target.value;
    
    // If user types +, allow international format
    if (value.startsWith('+')) {
      setPhoneNumber(value);
      return;
    }
    
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Limit to 10 digits for Indian numbers
    if (digits.length <= 10) {
      setPhoneNumber(formatPhoneNumber(digits));
    }
  };

  // ============================================
  // HANDLE ENTER KEY
  // ============================================
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!otpSent) {
        handleSendOTP();
      } else {
        handleVerifyOTP();
      }
    }
  };

  // ============================================
  // TOGGLE MOBILE MENU
  // ============================================
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <>
      {/* ============================================
          NAVBAR
          ============================================ */}
      <nav className="login-navbar">
        <div className="nav-container">
          <Link to="/" className="nav-brand">
            <span className="nav-logo-icon">🏺</span>
            <span className="nav-brand-text">ClayWare</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="nav-links desktop-nav">
            <Link to="/shop" className="nav-link">Shop</Link>
            <Link to="/about" className="nav-link">About</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
            <Link to="/register" className="nav-link nav-link-primary">Register</Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className={`nav-toggle ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <span className="toggle-bar"></span>
            <span className="toggle-bar"></span>
            <span className="toggle-bar"></span>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-nav-links">
            <Link to="/shop" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              Shop
            </Link>
            <Link to="/about" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              About
            </Link>
            <Link to="/contact" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              Contact
            </Link>
            <Link to="/register" className="mobile-nav-link mobile-nav-primary" onClick={() => setIsMobileMenuOpen(false)}>
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* ============================================
          LOGIN PAGE
          ============================================ */}
      <div className="login-container">
        {/* 3D Background */}
        <div className="background-3d">
          <canvas ref={canvasRef} className="canvas-3d" />
        </div>

        {/* Login Card */}
        <div className="login-card-wrapper">
          <div className="login-card">
            {/* Header */}
            <div className="login-header">
              <h1 className="login-title">Welcome Back</h1>
              <p className="login-subtitle">Sign in with your mobile number</p>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="message error">
                <span className="message-icon">⚠️</span>
                {error}
              </div>
            )}
            {success && (
              <div className="message success">
                <span className="message-icon">✓</span>
                {success}
              </div>
            )}

            {/* Login Form */}
            <form 
              className="login-form" 
              onSubmit={(e) => {
                e.preventDefault();
                if (!otpSent) {
                  handleSendOTP();
                } else {
                  handleVerifyOTP();
                }
              }}
            >
              {/* Phone Input */}
              <div className="form-group">
                <label className="form-label">Mobile Number</label>
                <div className="input-wrapper">
                  
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="Enter your mobile number"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    disabled={otpSent}
                    onKeyPress={handleKeyPress}
                    maxLength={15}
                    autoFocus
                  />
                </div>
                {phoneNumber && !otpSent && (
                  <div className={`input-hint ${getPhoneNumberError(phoneNumber) ? 'error' : 'success'}`}>
                    {getPhoneNumberError(phoneNumber) ? (
                      <span className="hint-error">⚠️ {getPhoneNumberError(phoneNumber)}</span>
                    ) : (
                      <span className="hint-success">✓ Valid mobile number</span>
                    )}
                  </div>
                )}
              </div>

              {/* OTP Input */}
              {otpSent && (
                <div className="form-group otp-group">
                  <label className="form-label">OTP Verification</label>
                  <div className="input-wrapper">
                    <span className="input-icon"></span>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter 4-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      onKeyPress={handleKeyPress}
                      maxLength={4}
                      autoFocus
                    />
                  </div>
                  {resendCooldown > 0 && (
                    <div className="resend-timer">
                      Resend available in {resendCooldown}s
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="login-button"
                disabled={loading || isVerifying}
              >
                {loading || isVerifying ? (
                  <span className="button-loader">
                    <span className="loader-spinner"></span>
                    {otpSent ? "Verifying..." : "Sending..."}
                  </span>
                ) : (
                  otpSent ? "Verify OTP" : "Send OTP"
                )}
              </button>

              {/* Resend OTP */}
              {otpSent && resendCooldown === 0 && (
                <button
                  type="button"
                  className="resend-button"
                  onClick={handleSendOTP}
                  disabled={loading}
                >
                  Resend OTP
                </button>
              )}
            </form>

            {/* Footer */}
            <div className="login-footer">
              <p className="register-text">
                Don't have an account?{" "}
                <span 
                  className="register-link" 
                  onClick={() => navigate("/register")}
                >
                  Create Account
                </span>
              </p>
              <div className="footer-divider">
                <span className="divider-line"></span>
                <span className="divider-dot">✦</span>
                <span className="divider-line"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;