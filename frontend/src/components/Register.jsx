import React, { useState } from "react";
import axios from "axios";
import { FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import { Link } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useNavigate } from "react-router-dom";

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const Register = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Xóa lỗi nếu người dùng bắt đầu chỉnh sửa
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.fullName) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!validatePassword(formData.password)) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      setErrors({});
      setSuccessMessage("");

      try {
        const response = await axios.post("http://localhost:5000/api/auth/register", {
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: "customer", // Mặc định role là 'customer'
        });

        setSuccessMessage("Registration successful! Please log in.");
        setFormData({
          fullName: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
      } catch (error) {
        const serverError = error.response?.data?.message || "An error occurred. Please try again.";
        setErrors({ server: serverError });
      } finally {
        setLoading(false);
      }
    } else {
      setErrors(newErrors);
    }
  };

  const handleGoogleLoginSuccess = async (response) => {
    console.log("Google login successful:", response);
    const token = response.credential;
  
    try {
      const res = await axios.post("http://localhost:5000/api/auth/google-login", { token });
      console.log("Backend response:", res.data);
  
      // Kiểm tra trạng thái isActive
      if (res.data.user.isActive) {
        localStorage.setItem("authToken", res.data.token);
        localStorage.setItem("userName", res.data.user.name);
        localStorage.setItem("userRole", res.data.user.role);
  
        // Gọi hàm onLoginSuccess để cập nhật trạng thái đăng nhập
        onLoginSuccess(res.data.user.name, res.data.user.role);
        // Chuyển hướng về trang Home sau khi đăng nhập thành công
        navigate("/");
      } else {
        setErrors({ general: "Your account has been banned. Please contact support for more details." });
        navigate("/banned");
      }
    } catch (error) {
      console.error("Error during backend call:", error);
      setErrors({ general: "Google login failed, please try again!" });
    }
  };
  
  
  
  
  const handleGoogleLoginFailure = (error) => {
    console.error("Google login failed:", error);
    setErrors({ general: "Google registration failed, please try again!" });
  };
  

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-pink-100 to-purple-100 py-12 px-4 sm:px-6 lg:px-8 mt-10">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Register your account</h2>
            <p className="text-gray-600">Join our community today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                className={`w-full px-4 py-3 rounded-lg border ${errors.fullName ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                value={formData.fullName}
                onChange={handleChange}
              />
              {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
            </div>

            <div>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                className={`w-full px-4 py-3 rounded-lg border ${errors.email ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                className={`w-full px-4 py-3 rounded-lg border ${errors.password ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
               
              </button>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm your password"
                className={`w-full px-4 py-3 rounded-lg border ${errors.confirmPassword ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
             
              </button>
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>

            {errors.server && <p className="text-red-500 text-sm mt-1">{errors.server}</p>}
            {errors.general && <p className="text-red-500 text-sm mt-1">{errors.general}</p>}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold"
              disabled={loading}
            >
              {loading ? "Registering..." : "Sign Up"}
            </button>

            {successMessage && <p className="text-green-500 text-sm mt-4">{successMessage}</p>}

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="flex items-center justify-center">
  <GoogleLogin
    onSuccess={handleGoogleLoginSuccess}
    onError={handleGoogleLoginFailure}
    render={(renderProps) => (
      <button
        type="button"
        onClick={renderProps.onClick}
        disabled={renderProps.disabled}
        className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
      >
        <FaGoogle className="text-red-500 mr-2" />
        Google
      </button>
    )}
  />
</div>

          </form>

          <p className="mt-6 text-center text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              Sign in now
            </Link>
          </p>
        </div>

        <footer className="max-w-5xl mx-auto mt-12 px-4">
          <div className="border-t border-gray-200 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex space-x-6">
              </div>
            </div>
          </div>
        </footer>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Register;
