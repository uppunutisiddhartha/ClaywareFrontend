import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";
import "./register.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    phone_number: "",
    password: "",
    confirmPassword: "",
    profile_image: null,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "profile_image") {
      setFormData({
        ...formData,
        profile_image: files[0],
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const data = new FormData();

    data.append("email", formData.email);
    data.append("phone_number", formData.phone_number);
    data.append("password", formData.password);
    data.append("role", "user");

    if (formData.profile_image) {
      data.append("profile_image", formData.profile_image);
    }

    try {
      setLoading(true);

      const res = await api.post(
        "/accounts/user-register/",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Registration Successful");
      navigate("/login");

    } catch (err) {
      console.log(err.response?.data);
      alert("Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">

      <form
        className="register-card"
        onSubmit={handleSubmit}
      >

        <h1>ClayWare</h1>

        <h2>Create Account</h2>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="phone_number"
          placeholder="Phone Number"
          value={formData.phone_number}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        <label>Profile Image (Optional)</label>

        <input
          type="file"
          name="profile_image"
          accept="image/*"
          onChange={handleChange}
        />

        <button
          type="submit"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Account"}
        </button>

        <p>
          Already have an account?
          <Link to="/login"> Login</Link>
        </p>

      </form>

    </div>
  );
}

export default Register;