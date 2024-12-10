import React, { useState } from "react";
import { FiMail, FiArrowLeft, FiCheck } from "react-icons/fi";
import { Link } from 'react-router-dom'; 
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isValidEmail, setIsValidEmail] = useState(false);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setIsValidEmail(validateEmail(value));
    setMessage({ type: "", text: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail) {
      setMessage({ type: "error", text: "Please enter a valid email address" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setMessage({
        type: "success",
        text: response.data.message,
      });
    } catch (error) {
      setMessage({ type: "error", text: error.response.data.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Forgot Password?
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please enter your email address. We will send a reset link.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="relative">
            <div className="flex items-center">
              <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                className={`block w-full pl-10 pr-3 py-3 border ${isValidEmail ? "border-green-500" : "border-gray-300"} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="Enter your email"
              />
              {isValidEmail && (
                <FiCheck className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" />
              )}
            </div>
            {message.type === "error" && (
              <p className="mt-2 text-sm text-red-600 transition-opacity duration-300">
                {message.text}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isLoading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200`}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              "Send Password Reset Link"
            )}
          </button>

          {message.type === "success" && (
            <div className="mt-3 text-sm text-center text-green-600 transition-opacity duration-300">
              {message.text}
            </div>
          )}

          <div className="text-center mt-4">
            <Link
              to="/login"
              className="flex items-center justify-center text-sm text-blue-600 hover:text-blue-500 transition-colors duration-200"
            >
              <FiArrowLeft className="mr-2" /> Back to Login Page
            </Link>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            <a href="#" className="hover:text-blue-500 transition-colors duration-200">
              Privacy Policy
            </a>
            <span className="mx-2">•</span>
            <span>
              Need help? Contact{" "}
              <a
                href="mailto:support@example.com"
                className="text-blue-600 hover:text-blue-500 transition-colors duration-200"
              >
                support@example.com
              </a>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
