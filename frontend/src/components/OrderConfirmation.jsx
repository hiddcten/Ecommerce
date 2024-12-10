import React, { useEffect } from "react";
import { FaCheckCircle } from "react-icons/fa";

const OrderConfirmation = () => {
  useEffect(() => {
    // Cài đặt cờ để đảm bảo trang chỉ reload một lần
    const hasReloaded = sessionStorage.getItem('hasReloaded');
    if (!hasReloaded) {
      sessionStorage.setItem('hasReloaded', 'true');
      window.location.reload();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 mt-24">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="text-center p-6 bg-green-50">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
              <FaCheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="mt-4 text-3xl font-bold text-green-600">Order Confirmed!</h2>
            <p className="mt-2 text-lg text-gray-600">
              Thank you! Your order has been placed successfully.
            </p>
          </div>
          <div className="px-6 py-8 text-center bg-gray-50">
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 flex flex-col sm:flex-row justify-center">
              <button
                className="inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                onClick={() => window.location.href = "/"}
              >
                Continue Shopping
              </button>
              <button
                className="inline-flex justify-center items-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                onClick={() => window.location.href = "/user-profile"}
              >
                View Order History
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
