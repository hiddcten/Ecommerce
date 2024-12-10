import React, { useState } from "react";
import { FaEye, FaEyeSlash, FaGoogle, FaTwitter, FaLinkedin, FaInstagram } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { BiLock } from "react-icons/bi";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;


const Login = ({ onLoginSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    const validationErrors = {};
    if (!email) validationErrors.email = "Email is required";
    if (!password) validationErrors.password = "Password is required";
  
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }
  
    try {
      const trimmedEmail = email.trim().toLowerCase();
      console.log('Attempting login with', { email: trimmedEmail, password });
      const response = await axios.post("http://localhost:5000/api/auth/login", { email: trimmedEmail, password });
  
      // Kiểm tra trạng thái isActive
      if (response.data.user.isActive) {
        localStorage.setItem("authToken", response.data.token);
        localStorage.setItem("userName", response.data.user.name);
        localStorage.setItem("userRole", response.data.user.role);
  
        onLoginSuccess(response.data.user.name, response.data.user.role);
        navigate("/");
      } else {
        navigate("/banned");
      }
    } catch (error) {
      console.error('Login failed:', error);
  
      // Kiểm tra mã lỗi 403 (Forbidden) để điều hướng đến trang bị cấm
      if (error.response && error.response.status === 403) {
        setErrors({ general: "Your account has been banned. Please contact support for more details." });
        navigate("/banned");
      } else {
        setErrors({ general: "Đăng nhập thất bại, vui lòng thử lại!" });
      }
    } finally {
      setLoading(false);
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
    setErrors({ general: "Đăng nhập bằng Google thất bại, vui lòng thử lại!" });
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 p-4">
        <div className="absolute inset-0 z-0 backdrop-blur-sm bg-opacity-50" style={{ backgroundImage: `url("images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.0.3")`, backgroundSize: "cover" }} />

        <div className="w-full max-w-md z-10">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Welcome Back!</h2>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <div className="relative">
                  <MdEmail className="absolute top-3 left-3 text-gray-400" />
                  <input
                    type="email"
                    className={`w-full pl-10 pr-4 py-2 border ${errors.email ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:border-blue-500`}
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>

              <div>
                <div className="relative">
                  <BiLock className="absolute top-3 left-3 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`w-full pl-10 pr-12 py-2 border ${errors.password ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:border-blue-500`}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Sign In"
                )}
              </button>

              {errors.general && <p className="mt-1 text-sm text-red-500">{errors.general}</p>}

              <div className="text-center">
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                  Forgot your password?
                </Link>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <GoogleLogin
                  onSuccess={handleGoogleLoginSuccess}
                  onError={handleGoogleLoginFailure}
                  render={(renderProps) => (
                    <button
                      type="button"
                      onClick={renderProps.onClick}
                      disabled={renderProps.disabled}
                      className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300"
                    >
                      <FaGoogle className="text-red-500 mr-2" />
                      Google
                    </button>
                  )}
                />
              </div>

              <p className="text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <Link to="/register" className="text-blue-600 hover:underline">
                  Sign up
                </Link>
              </p>
            </form>
          </div>

          <footer className="mt-8 text-center">
            <div className="flex justify-center space-x-4 mb-4">
            </div>
            <div className="text-sm text-gray-600 space-x-4">
              <a href="#" className="hover:text-gray-900">Privacy Policy</a>
              <span>•</span>
              <a href="#" className="hover:text-gray-900">Terms of Service</a>
              <span>•</span>
              <a href="#" className="hover:text-gray-900">Contact Us</a>
            </div>
            <p className="mt-4 text-sm text-gray-600">© 2024 BinhTruongVan. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
