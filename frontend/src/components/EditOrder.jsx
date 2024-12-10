import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const EditOrder = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    customerName: "",
    shippingAddress: "",
    products: [],
    total: 0,
    status: "pending",
    orderDate: ""
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/orders/${id}`);
        const order = response.data.order;
  
        setFormData(prevData => ({
          ...prevData,
          customerName: order.address ? order.address.name : "",
          shippingAddress: order.address ? order.address.fullAddress : "",
          phone: order.address ? order.address.phone : "",
          region: order.address ? order.address.region : "",
          products: order.products.map(product => ({
            id: product.productId ? product.productId._id : "Unknown ID",
            name: product.productId ? product.productId.name : "Unknown Product",
            quantity: product.quantity,
            price: product.productId ? product.productId.price : 0
          })),
          total: order.total,
          status: order.status,
          orderDate: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ""
        }));
      } catch (error) {
        console.error("There was an error fetching the order data!", error);
      }
    };
  
    fetchOrder();
  }, [id]);
  
  const validateForm = () => {
    const newErrors = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = "Customer name is required";
    }

    if (!formData.shippingAddress.trim()) {
      newErrors.shippingAddress = "Shipping address is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Đảm bảo các giá trị đầu vào không bị undefined
const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value || "" // Đảm bảo không bị undefined
    }));
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await axios.put(`http://localhost:5000/api/orders/${id}`, {
          address: {
            name: formData.customerName,
            phone: formData.phone,
            region: formData.region,
            fullAddress: formData.shippingAddress
          },
          status: formData.status
        });
  
        if (response.status === 200) {
          console.log("Order updated:", response.data);
          toast.success('Order updated successfully!'); // Thêm thông báo thành công
        } else {
          console.error("Error updating order:", response.data);
        }
      } catch (error) {
        console.error("There was an error updating the order!", error);
      }
    }
  };
  
  
  

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 mt-24">
      <ToastContainer />
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Order</h2>

        <form onSubmit={handleSubmit} className="space-y-6 text-left">
  <div>
    <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 text-left">
      Customer Name
    </label>
    <input
      type="text"
      id="customerName"
      name="customerName"
      value={formData.customerName || ""}
      onChange={handleInputChange}
      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.customerName ? "border-red-500" : ""}`}
    />
    {errors.customerName && <p className="mt-1 text-sm text-red-600 text-left">{errors.customerName}</p>}
  </div>

  <div>
    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 text-left">
      Phone Number
    </label>
    <input
      type="text"
      id="phone"
      name="phone"
      value={formData.phone || ""}
      onChange={handleInputChange}
      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.phone ? "border-red-500" : ""}`}
    />
    {errors.phone && <p className="mt-1 text-sm text-red-600 text-left">{errors.phone}</p>}
  </div>

  <div>
    <label htmlFor="region" className="block text-sm font-medium text-gray-700 text-left">
      Region
    </label>
    <input
      type="text"
      id="region"
      name="region"
      value={formData.region || ""}
      onChange={handleInputChange}
      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.region ? "border-red-500" : ""}`}
    />
    {errors.region && <p className="mt-1 text-sm text-red-600 text-left">{errors.region}</p>}
  </div>

  <div>
    <label htmlFor="shippingAddress" className="block text-sm font-medium text-gray-700 text-left">
      Shipping Address
    </label>
    <input
      type="text"
      id="shippingAddress"
      name="shippingAddress"
      value={formData.shippingAddress || ""}
      onChange={handleInputChange}
      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.shippingAddress ? "border-red-500" : ""}`}
    />
    {errors.shippingAddress && <p className="mt-1 text-sm text-red-600 text-left">{errors.shippingAddress}</p>}
  </div>

  <div>
    <label htmlFor="products" className="block text-sm font-medium text-gray-700 text-left">
      Products
    </label>
    <ul>
      {formData.products.map((product, index) => (
        <li key={index} className="mt-2">
          {product.name} - Quantity: {product.quantity}, Price: ${product.price}
        </li>
      ))}
    </ul>
  </div>

  <div>
    <label htmlFor="total" className="block text-sm font-medium text-gray-700 text-left">
      Total Amount
    </label>
    <input
      type="number"
      id="total"
      name="total"
      value={formData.total || 0}
      readOnly
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
    />
  </div>

  <div>
    <label htmlFor="orderDate" className="block text-sm font-medium text-gray-700 text-left">
      Order Date
    </label>
    <input
      type="text"
      id="orderDate"
      name="orderDate"
      value={formData.orderDate || ""}
      readOnly
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
    />
  </div>

  <div className="flex items-center justify-between">
    <label htmlFor="status" className="block text-sm font-medium text-gray-700 text-left">
      Status
    </label>
    <select
      id="status"
      name="status"
      value={formData.status || "pending"}
      onChange={handleInputChange}
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
    >
      <option value="pending">Pending</option>
      <option value="processing">Processing</option>
      <option value="completed">Completed</option>
      <option value="canceled">Canceled</option>
    </select>
  </div>
  <div>
    <button
      type="submit"
      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      Save Changes
    </button>
  </div>
</form>
      </div>
    </div>
  );
};

export default EditOrder;
