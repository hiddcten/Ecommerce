import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaMoneyBill } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate } from 'react-router-dom';


const CheckoutPage = () => {
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState({ name: "", phone: "", region: "", fullAddress: "" });
  const [editAddress, setEditAddress] = useState(null);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(20);
  const [pointsUsed, setPointsUsed] = useState(0);
  const [voucher, setVoucher] = useState(null);
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [shippingMethod, setShippingMethod] = useState("none");
  const [shippingCost, setShippingCost] = useState(0);
  const [total, setTotal] = useState(0);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [tax, setTax] = useState(0); // Thêm biến tax
  const [pointsEarned, setPointsEarned] = useState(0);
  const navigate = useNavigate();
  const pointsEarnRate = 0.05;

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get("http://localhost:5000/api/users/addresses", { headers });
        setAddresses(response.data.addresses);
        if (response.data.addresses.length > 0) {
          setSelectedAddress(response.data.addresses[0]);
        }
      } catch (error) {
        console.error("There was an error fetching the addresses!", error);
      }
    };
  
    const fetchCartItems = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get("http://localhost:5000/api/cart", { headers });
        console.log("Fetched cart items:", response.data.cartItems);
        setCartItems(response.data.cartItems);
  
        const calculatedSubtotal = response.data.cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
        setSubtotal(parseFloat(calculatedSubtotal.toFixed(2))); // Chuyển đổi thành double
  
        if (response.data.voucher) {
          setVoucher(response.data.voucher);
          setVoucherDiscount(response.data.voucher.discount);
        } else {
          setVoucher(null);
          setVoucherDiscount(0);
        }
  
        // Lấy chính xác giá trị pointsUsed từ giỏ hàng
        if (response.data.loyaltyPoints !== undefined) {
          setPointsUsed(response.data.loyaltyPoints);
        } else {
          setPointsUsed(0);
        }
  
        let shippingFee = 0;
        if (response.data.shippingMethod) {
          setShippingMethod(response.data.shippingMethod);
          shippingFee = response.data.shippingMethod === 'standard' ? calculatedSubtotal * 0.05 : (response.data.shippingMethod === 'express' ? calculatedSubtotal * 0.08 : 0);
          setShippingCost(parseFloat(shippingFee.toFixed(2))); // Chuyển đổi thành double
        }
  
        const tax = calculatedSubtotal * 0.10; // Tính thuế 10%
        setTax(tax);
  
        let calculatedTotal = calculatedSubtotal - (response.data.voucher ? response.data.voucher.discount : 0) - (response.data.loyaltyPoints * 0.1) + shippingFee + tax;
        if (calculatedTotal < 0) calculatedTotal = 0; // Đảm bảo giá trị tối thiểu là 0$
        calculatedTotal = parseFloat(calculatedTotal.toFixed(2)); // Chuyển đổi thành double
        setTotal(calculatedTotal);
  
        const calculatedPointsEarned = Math.floor(calculatedTotal * pointsEarnRate);
        setPointsEarned(calculatedPointsEarned);
      } catch (error) {
        console.error("There was an error fetching the cart items!", error);
      }
    };
  
    fetchAddresses();
    fetchCartItems();
  }, []);
  
  const handleNewAddressSubmit = async (e) => {
    e.preventDefault();

    if (!newAddress.fullAddress) {
      toast.error("Full Address is required.");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

      if (editingAddressId) {
        await axios.put(`http://localhost:5000/api/users/addresses/${editingAddressId}`, newAddress, { headers });
        setAddresses(addresses.map(address => address._id === editingAddressId ? newAddress : address));
        toast.success("Address updated successfully");
      } else {
        const response = await axios.post("http://localhost:5000/api/users/addresses", newAddress, { headers });
        setAddresses([...addresses, response.data.address]);
        toast.success("Address added successfully");
      }

      setShowNewAddressForm(false);
      setSelectedAddress(newAddress);
      setEditingAddressId(null);
      setNewAddress({ name: "", phone: "", region: "", fullAddress: "" });

    } catch (error) {
      console.error("There was an error adding/updating the address!", error);
      toast.error("Failed to add/update address");
    }
  };

  const saveAddress = async (addressId, updatedAddress) => {
    try {
      const token = localStorage.getItem("authToken");
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
      await axios.put(`http://localhost:5000/api/users/addresses/${addressId}`, updatedAddress, { headers });
      setAddresses(addresses.map(address => address._id === addressId ? updatedAddress : address));
      toast.success("Address updated successfully");
    } catch (error) {
      console.error("There was an error updating the address!", error);
      toast.error("Failed to update address");
    }
  };

  const handleEditSave = async () => {
    if (editingAddressId && editAddress) {
      await saveAddress(editingAddressId, editAddress);
      setEditingAddressId(null);
      setEditAddress(null);
    }
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty. Please add items to your cart before placing an order.");
      return;
    }
  
    if (!selectedAddress) {
      toast.error("Please select a shipping address.");
      return;
    }

  let calculatedTotal = Math.max(total, 0);
  calculatedTotal = calculatedTotal === 0 ? 0.0 : parseFloat(calculatedTotal.toFixed(2)); // Đảm bảo kiểu double

  try {
    const token = localStorage.getItem("authToken");
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    // Giải mã token để lấy userId
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.userId;

    console.log("User ID:", userId);
    console.log("Cart Items:", cartItems);

    const orderData = {
      userId: userId,
      products: cartItems.map(item => ({
        productId: item.productId._id || item.productId, // Đảm bảo `productId` là đúng từ cartItems
        quantity: item.quantity
      })),
      total: calculatedTotal,
      status: 'pending',
      createdAt: new Date(),
      pointsEarned: Math.max(pointsEarned, 0),
      address: {
        name: selectedAddress.name,
        phone: selectedAddress.phone,
        region: selectedAddress.region,
        fullAddress: selectedAddress.fullAddress
      },
      pointsUsed // Thêm thông tin pointsUsed để gửi lên server
    };

    console.log("Order Data:", orderData);

    await axios.post("http://localhost:5000/api/orders", orderData, { headers });
    toast.success("Order placed successfully!");

    // Điều hướng tới trang xác nhận đơn hàng
    setOrderPlaced(true);
    navigate('/order-confirmation');

    // Xóa giỏ hàng trong cơ sở dữ liệu
    await axios.delete("http://localhost:5000/api/cart", { headers });

    // Reset lại giỏ hàng trên client
    setCartItems([]);
    setSubtotal(0);
    setTotal(0);
    setPointsUsed(0);
    setVoucher(null);
    setVoucherDiscount(0);
    setShippingMethod("none");
    setShippingCost(0);
    setPointsEarned(0);
  } catch (error) {
    console.error("There was an error placing the order!", error.response?.data || error);
    toast.error("Failed to place order");
    if (error.response && error.response.data && error.response.data.errInfo) {
      console.error("Validation error details:", error.response.data.errInfo.details);
    } else {
      console.error("Unknown error occurred", error);
    }
  }
};

  

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 mt-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>
            
            <div>
              {addresses.length > 0 && !showNewAddressForm ? (
                <div className="space-y-4">
                  {addresses.map((addr, index) => (
                    <div key={`${addr._id}-${index}`} className="flex items-center">
                      <input
                        type="radio"
                        name="address"
                        value={addr._id}
                        checked={selectedAddress && selectedAddress._id === addr._id}
                        onChange={() => setSelectedAddress(addr)}
                        className="mr-4"
                      />
                      <div
                        className={`p-4 border rounded-lg cursor-pointer text-left flex-1 ${selectedAddress?._id === addr._id ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
                        onClick={() => setSelectedAddress(addr)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{addr.name}</p>
                            <p>{addr.phone}</p>
                            <p>{addr.region}</p>
                            <p>{addr.fullAddress}</p>
                          </div>
                          <button
                            className="text-blue-600 hover:text-blue-800"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowNewAddressForm(true);
                              setNewAddress(addr);
                              setEditingAddressId(addr._id);
                            }}
                          >
                            <FaEdit size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    className="w-full py-2 px-4 border border-blue-500 text-blue-500 rounded hover:bg-blue-50"
                    onClick={() => setShowNewAddressForm(true)}
                  >
                    Add New Address
                  </button>
                </div>
              ) : (
                <form onSubmit={handleNewAddressSubmit} className="space-y-4 text-left">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={newAddress.name}
                    onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Region</label>
                  <select
                    value={newAddress.region}
                    onChange={(e) => setNewAddress({ ...newAddress, region: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  >
                    <option value="" disabled>Select Region</option>
                    <option value="Northern Vietnam">Northern Vietnam</option>
                    <option value="Central Vietnam">Central Vietnam</option>
                    <option value="Southern Vietnam">Southern Vietnam</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Address</label>
                  <input
                    type="text"
                    value={newAddress.fullAddress}
                    onChange={(e) => setNewAddress({ ...newAddress, fullAddress: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                  >
                    Save Address
                  </button>
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(false)}
                      className="flex-1 border border-gray-300 py-2 px-4 rounded hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>

          {/* Payment Method Section */}
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4">Payment Method</h3>
            <div className="p-4 bg-gray-50 rounded flex items-center">
              <FaMoneyBill className="text-green-600 mr-2" size={24} />
              <span className="font-medium">Cash Only</span>
            </div>
          </div>
        </div>

        {/* Order Summary Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
          <div className="space-y-4">
            {cartItems.map((item, index) => (
              <div key={`${item.id}-${index}`} className="flex justify-between items-center py-2 border-b">
                <div className="flex items-center">
                  <img 
                    src={`http://localhost:5000${item.image}`} // Cập nhật URL lấy ảnh từ sản phẩm
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-md mr-4"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/150"; // Ảnh mẫu dự phòng nếu ảnh sản phẩm không hiển thị
                    }}
                  />
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                </div>
                <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {voucher && (
              <div className="flex justify-between text-green-600">
                <span>Voucher Discount ({voucher.code})</span>
                <span>-${voucherDiscount.toFixed(2)}</span>
              </div>
            )}
            {pointsUsed > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Points Used ({pointsUsed} pts)</span>
                <span>-${(pointsUsed * 0.1).toFixed(2)}</span>
              </div>
            )}
            {shippingMethod !== 'none' && (
              <div className="flex justify-between text-black">
                <span>Shipping ({shippingMethod})</span>
                <span>${shippingCost.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Tax (10%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold">Total</span>
                <span className="text-xl font-bold">${total.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between text-blue-600">
              <span>Points Earned</span>
              <span>{pointsEarned} pts</span>
            </div>
          </div>
          <button
  className={`w-full mt-6 py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${cartItems.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
  onClick={handlePlaceOrder}
  disabled={cartItems.length === 0}
>
  Place Order
</button>

        </div>
      </div>
    </div>
    <ToastContainer />
  </div>
);
};

export default CheckoutPage;
