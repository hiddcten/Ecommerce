import React, { useState } from "react";
import { FaBan, FaEnvelope, FaHome } from "react-icons/fa";

const BannedNotification = () => {
  const [showContactModal, setShowContactModal] = useState(false);

  const handleContactSupport = () => {
    setShowContactModal(true);
  };

  const handleCloseModal = () => {
    setShowContactModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center">
          <div className="flex justify-center">
            <FaBan className="text-6xl text-red-500 mb-4" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Your account has been banned
          </h1>
          <p className="text-gray-600 mb-8">
            We have detected a violation of our terms of service. Your account access has been suspended.
          </p>
          <div className="space-y-4">
            <button
              onClick={handleContactSupport}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center transition duration-300"
            >
              <FaEnvelope className="mr-2" />
              Contact Support
            </button>
            <button
              onClick={() => window.location.href = "/"}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg flex items-center justify-center transition duration-300"
            >
              <FaHome className="mr-2" />
              Go to Homepage
            </button>
          </div>
        </div>
      </div>

      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Contact Support</h2>
            <p className="text-gray-600 mb-6">

            </p>
            <div className="mb-6">
              <p className="text-gray-800">
                <strong>Email:</strong> BachPhuongBinh@gmail.com
              </p>
              <p className="text-gray-800">
                <strong>Contact this email for more info</strong>
              </p>
            </div>
            <button
              onClick={handleCloseModal}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannedNotification;