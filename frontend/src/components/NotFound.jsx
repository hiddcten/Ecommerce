import React from "react";
import { FaHome, FaHeadset, FaShieldAlt } from "react-icons/fa";
import { Link } from 'react-router-dom';

const NotFound = () => {
  const handleHomeClick = () => {
    console.log("Navigating to home");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 font-poppins">
            404 - Page Not Found
          </h1>
          <p className="text-lg text-gray-600">
            We could not find the page you requested.
          </p>
        </div>

        <div className="space-y-6">
  <Link
    to="/" // Đường dẫn đến trang chủ
    className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 flex items-center justify-center mx-auto space-x-2"
  >
    <FaHome className="text-xl" />
    <span>Return to Homepage</span>
  </Link>
</div>


        <footer className="mt-12 text-gray-600">
          <p>Cannot find what you need?</p>
          <div className="flex items-center justify-center space-x-4 mt-2">
            <a
              href="#"
              className="flex items-center space-x-1 hover:text-blue-600 transition-colors duration-200"
            >
              <FaHome className="text-sm" />
              <span>Home</span>
            </a>
            <span>|</span>
            <a
              href="#"
              className="flex items-center space-x-1 hover:text-blue-600 transition-colors duration-200"
            >
              <FaHeadset className="text-sm" />
              <span>Support</span>
            </a>
            <span>|</span>
            <a
              href="#"
              className="flex items-center space-x-1 hover:text-blue-600 transition-colors duration-200"
            >
              <FaShieldAlt className="text-sm" />
              <span>Privacy Policy</span>
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default NotFound;