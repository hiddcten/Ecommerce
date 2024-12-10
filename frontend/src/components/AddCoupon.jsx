import React, { useState } from "react";
import { FaToggleOn, FaToggleOff } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



const AddCoupon = () => {
  const [formData, setFormData] = useState({
    code: "",
    discount: "",
    validFrom: "",
    validTo: "",
    isActive: false
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
  
    if (!formData.code.trim()) {
      newErrors.code = "Coupon code is required";
    }
  
    const discountValue = parseFloat(formData.discount);
    if (isNaN(discountValue) || discountValue <= 0) {
      newErrors.discount = "Discount must be a positive number representing the dollar amount.";
    }
  
    if (!formData.validFrom) {
      newErrors.validFrom = "Valid from date is required";
    }
  
    if (!formData.validTo) {
      newErrors.validTo = "Valid to date is required";
    }
  
    if (formData.validFrom && formData.validTo && new Date(formData.validFrom) > new Date(formData.validTo)) {
      newErrors.validTo = "Valid to date must be after valid from date";
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleStatus = () => {
    setFormData(prev => ({
      ...prev,
      isActive: !prev.isActive
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      const formDataToSend = {
        code: formData.code,
        discount: parseInt(formData.discount, 10), // Ensure this is an integer
        validFrom: new Date(formData.validFrom).toISOString(),
        validTo: new Date(formData.validTo).toISOString(),
        status: formData.isActive ? 'active' : 'canceled',
        createdAt: new Date().toISOString()
      };
  
      console.log("Form data to be sent:", formDataToSend); // Log dữ liệu gửi đi
  
      try {
        const response = await fetch("http://localhost:5000/api/promotions/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formDataToSend)
        });
  
        if (response.ok) {
          const data = await response.json();
          console.log("Promotion created:", data);
          toast.success('Coupon added successfully!'); // Thêm thông báo thành công
          setFormData({
            code: "",
            discount: "",
            validFrom: "",
            validTo: "",
            isActive: false
          });
          setErrors({});
        } else {
          const errorData = await response.json();
          console.error("Error creating promotion:", errorData);
        }
      } catch (error) {
        console.error("There was an error creating the promotion!", error);
      }
    }
  };
  
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 mt-24">
      <ToastContainer />
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Coupon</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 text-left">
              Coupon Code
            </label>
            <input
              type="text"
              id="code"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.code ? "border-red-500" : ""}`}
            />
            {errors.code && <p className="mt-1 text-sm text-red-600 text-left">{errors.code}</p>}
          </div>

          <div>
            <label htmlFor="discount" className="block text-sm font-medium text-gray-700 text-left">
              Discount Amount
            </label>
            <input
              type="number"
              id="discount"
              name="discount"
              value={formData.discount}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.discount ? "border-red-500" : ""}`}
            />
            {errors.discount && <p className="mt-1 text-sm text-red-600 text-left">{errors.discount}</p>}
          </div>

          <div>
            <label htmlFor="validFrom" className="block text-sm font-medium text-gray-700 text-left">
              Valid From
            </label>
            <input
              type="date"
              id="validFrom"
              name="validFrom"
              value={formData.validFrom}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.validFrom ? "border-red-500" : ""}`}
            />
            {errors.validFrom && <p className="mt-1 text-sm text-red-600 text-left">{errors.validFrom}</p>}
          </div>

          <div>
            <label htmlFor="validTo" className="block text-sm font-medium text-gray-700 text-left">
              Valid To
            </label>
            <input
              type="date"
              id="validTo"
              name="validTo"
              value={formData.validTo}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.validTo ? "border-red-500" : ""}`}
            />
            {errors.validTo && <p className="mt-1 text-sm text-red-600 text-left">{errors.validTo}</p>}
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 text-left">
              Status
            </label>
            <button
              type="button"
              onClick={toggleStatus}
              className="focus:outline-none"
              aria-pressed={formData.isActive}
              role="switch"
            >
              {formData.isActive ? (
                <FaToggleOn className="h-8 w-8 text-indigo-600" />
              ) : (
                <FaToggleOff className="h-8 w-8 text-gray-400" />
              )}
            </button>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create Coupon
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCoupon;
