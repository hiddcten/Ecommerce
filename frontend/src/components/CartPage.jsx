import React, { useState, useEffect } from "react";
import { FiShoppingCart, FiUser, FiTrash2, FiChevronLeft, FiSearch, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { Link } from "react-router-dom";

const CartPage = ({ cartItems = [], setCartItems }) => {
  const [cart, setCart] = useState([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [discountCode, setDiscountCode] = useState("");
  const [isDiscountApplied, setIsDiscountApplied] = useState(false);
  const [selectedPoints, setSelectedPoints] = useState(0);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [selectedShipping, setSelectedShipping] = useState("standard"); // Thêm state cho tùy chọn giao hàng
  const [showPoints, setShowPoints] = useState(false);
  const [showVouchers, setShowVouchers] = useState(false);
  const [availableVouchers, setAvailableVouchers] = useState([]);

  const totalPoints = loyaltyPoints; // Sử dụng loyaltyPoints từ state
  const pointsOptions = [100, 200, 500];
  const pointsValue = selectedPoints * 0.1;

  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      const token = localStorage.getItem("authToken");
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.post(`http://localhost:5000/api/cart/update`, { productId: id, quantity: newQuantity }, { headers });
      
      setCartItems(response.data.cartItems); // Cập nhật giỏ hàng sau khi thay đổi số lượng
      toast.success("Quantity updated successfully");
    } catch (error) {
      console.error("There was an error updating the quantity!", error);
      toast.error("Failed to update quantity");
    }
  };

  useEffect(() => {
    const fetchCartAndPoints = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const headers = { Authorization: `Bearer ${token}` };
  
        const cartResponse = await axios.get("http://localhost:5000/api/cart", { headers });
        const pointsResponse = await axios.get("http://localhost:5000/api/users/loyalty-points", { headers });
        const vouchersResponse = await axios.get("http://localhost:5000/api/promotions", { headers });
  
        setCart(cartResponse.data.cartItems);
        setLoyaltyPoints(pointsResponse.data.loyaltyPoints);
  
        const validVouchers = vouchersResponse.data.filter(voucher => voucher.status !== "canceled" && voucher.status !== "expired");
        setAvailableVouchers(validVouchers);
  
        if (cartResponse.data.shippingMethod) {
          setSelectedShipping(cartResponse.data.shippingMethod);
        } else {
          setSelectedShipping("none");
        }
  
        if (cartResponse.data.voucher) {
          setSelectedVoucher(cartResponse.data.voucher);
        }
  
        setSelectedPoints(0); 
      } catch (error) {
        console.error("Error fetching cart data:", error);
        toast.error("Error fetching cart data");
      }
    };
  
    fetchCartAndPoints();
  }, []);
  
  
  const removeItem = async (id) => {
    try {
      const token = localStorage.getItem("authToken");
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.delete(`http://localhost:5000/api/cart/${id}`, { headers });
      
      setCartItems(response.data.cartItems); // Cập nhật giỏ hàng sau khi xóa sản phẩm
      toast.success("Product removed from cart");
    } catch (error) {
      console.error("There was an error removing the item from the cart!", error);
      toast.error("Failed to remove product from cart");
    }
  };
  
  useEffect(() => {
    const updateCartDetails = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const headers = { Authorization: `Bearer ${token}` };
        await axios.post("http://localhost:5000/api/cart/update-details", {
          shippingMethod: selectedShipping,
          voucher: selectedVoucher?._id,
          loyaltyPoints: selectedPoints,
        }, { headers });
        console.log("Cart details updated with shipping method:", selectedShipping); // Kiểm tra xem giá trị shippingMethod có được lưu đúng hay không
      } catch (error) {
        console.error("There was an error updating the cart details!", error);
      }
    };
  
    updateCartDetails();
  }, [selectedShipping, selectedVoucher, selectedPoints]);
  
  const handlePointsSelection = async (points) => {
    setSelectedPoints(points);
    toast.success(`${points} points selected`);
  
    try {
      const token = localStorage.getItem("authToken");
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
      await axios.post("http://localhost:5000/api/cart/update-details", {
        loyaltyPoints: points,
      }, { headers });

    } catch (error) {
      console.error("There was an error updating the points!", error);
      toast.error("Failed to update points");
    }
  };
  
  const handleCancelPoints = async () => {
    setSelectedPoints(0);
    toast.info("Points selection canceled");
  
    try {
      const token = localStorage.getItem("authToken");
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
      await axios.post("http://localhost:5000/api/cart/update-details", {
        loyaltyPoints: 0,
      }, { headers });
    } catch (error) {
      console.error("There was an error resetting the points!", error);
      toast.error("Failed to reset points");
    }
  };

  const handleVoucherSelection = async (voucher) => {
    setSelectedVoucher(voucher);
    toast.success(`${voucher.code} voucher selected`);
  
    try {
      const token = localStorage.getItem("authToken");
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
      const response = await axios.post("http://localhost:5000/api/cart/update-details", {
        voucher: voucher._id,
      }, { headers });
      console.log("Voucher added to cart:", response.data); // Ghi nhật ký phản hồi
    } catch (error) {
      console.error("There was an error adding the voucher!", error); // Ghi nhật ký lỗi chi tiết
      toast.error("Failed to add voucher");
    }
  };
  
  const handleCancelVoucherSelection = async () => {
    setSelectedVoucher(null);
  
    try {
      const token = localStorage.getItem("authToken");
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
      const response = await axios.post("http://localhost:5000/api/cart/update-details", {
        voucher: null,
      }, { headers });
      console.log("Voucher removed from cart:", response.data); // Ghi nhật ký phản hồi
      toast.success("Voucher removed from cart"); // Thông báo thành công khi yêu cầu đã hoàn thành
    } catch (error) {
      console.error("There was an error canceling the voucher!", error); // Ghi nhật ký lỗi chi tiết
      toast.error("Failed to cancel voucher");
    }
  };
  
  const handleShippingSelection = (e) => {
    const selectedValue = e.target.value;
    setSelectedShipping(selectedValue === "store" ? "none" : selectedValue);
  };
  
  const calculateShippingCost = () => {
    if (selectedShipping === "store") return 0;
    if (selectedShipping === "standard") return subtotal * 0.05;
    if (selectedShipping === "express") return subtotal * 0.08;
    return 0;
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.10;
  const shipping = calculateShippingCost(); // Tính phí vận chuyển
  const discount = isDiscountApplied ? subtotal * 0.20 : 0; // Nếu có mã giảm giá áp dụng phần trăm
  const pointsDiscount = pointsValue;
  const voucherDiscount = selectedVoucher ? selectedVoucher.discount : 0; // Sử dụng giá trị giảm từ voucher
  let total = subtotal + tax + shipping - discount - pointsDiscount - voucherDiscount;
  total = Math.max(total, 0); // Đảm bảo tổng giá trị không âm
  const earnedPoints = Math.floor(total * 0.05); // Tính điểm loyalty earned
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 mt-16">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Cart Items */}
          <div className="lg:col-span-2 text-left">
            <h2 className="text-2xl font-bold mb-4">YOUR CART</h2>
            <p className="text-gray-600 mb-6">You have {cart.length} products in your cart ^-^</p>

            {cart.length === 0 ? (
  <div className="text-center py-12">
    <p className="text-xl text-gray-600 mb-4">Your cart is empty. Keep shopping!</p>
    <button 
      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
      onClick={() => window.location.href = "/"} // Thêm sự kiện onClick để điều hướng
    >
      Continue Shopping
    </button>
  </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.productId ? item.productId._id || item.productId : item._id} className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <img
                        src={`http://localhost:5000${item.image}`}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded"
                        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1595246140520-1991cca1aaaa"; }}
                      />
                      <div className="ml-4 flex-1">
                        <div className="flex justify-between">
                          <Link to={`/product-detail/${item.productId ? item.productId.slug : 'undefined'}`} className="font-semibold text-lg">
                            {item.name}
                          </Link>
                          <button
                            onClick={() => removeItem(item.productId ? item.productId._id || item.productId : item._id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FiTrash2 size={20} />
                          </button>
                        </div>
                        <div className="mt-2">
                          <span className="text-blue-600 font-bold">${item.price}</span>
                          {item.regularPrice && (
                            <span className="ml-2 text-gray-400 line-through">
                              ${item.regularPrice}
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex items-center">
                          <button
                            onClick={() => updateQuantity(item.productId ? item.productId._id || item.productId : item._id, item.quantity - 1)}
                            className="px-2 py-1 border rounded-l"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(item.productId ? item.productId._id || item.productId : item._id, parseInt(e.target.value))
                            }
                            className="w-16 text-center border-t border-b"
                          />
                          <button
                            onClick={() => updateQuantity(item.productId ? item.productId._id || item.productId : item._id, item.quantity + 1)}
                            className="px-2 py-1 border rounded-r"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Shipping Options */}
            <div className="mt-6 bg-white p-6 rounded-lg shadow-sm mb-6">
              <h3 className="text-lg font-semibold mb-4">Shipping Options</h3>
              <div className="flex flex-col space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="shipping"
                    value="none"
                    checked={selectedShipping === "none"}
                    onChange={handleShippingSelection}
                    className="mr-2"
                  />
                  Pick up at Store (Free)
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="shipping"
                    value="standard"
                    checked={selectedShipping === "standard"}
                    onChange={handleShippingSelection}
                    className="mr-2"
                  />
                  Standard (5% of product price)
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="shipping"
                    value="express"
                    checked={selectedShipping === "express"}
                    onChange={handleShippingSelection}
                    className="mr-2"
                  />
                  Express (8% of product price)
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              {/* Points Section with Toggle */}
              <div className="mb-6 border-b pb-6">
                <button
                  onClick={() => setShowPoints(!showPoints)}
                  className="flex items-center justify-between w-full text-lg font-semibold"
                >
                  <span>Use Points</span>
                  {showPoints ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                {showPoints && (
                  <div className="mt-4 space-y-3">
                    <p className="text-gray-600 mb-4">Available Points: {totalPoints}</p>
                    {pointsOptions.map((points) => (
                      <div key={points} className="flex items-center">
                        <input
                          type="radio"
                          id={`points-${points}`}
                          name="points"
                          checked={selectedPoints === points}
                          onChange={() => handlePointsSelection(points)}
                          className={`mr-2 ${totalPoints < points ? 'cursor-not-allowed' : ''}`}
                          disabled={totalPoints < points}
                        />
                        <label htmlFor={`points-${points}`} className={`flex justify-between w-full ${totalPoints < points ? 'text-gray-400' : ''}`}>
                          <span>{points} Points</span>
                          <span className="text-green-600">${(points * 0.1).toFixed(2)}</span>
                        </label>
                      </div>
                    ))}
                    {selectedPoints > 0 && (
                      <button
                        onClick={() => handleCancelPoints()}
                        className="mt-4 text-red-500 hover:underline"
                      >
                        Cancel Points Selection
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Vouchers Section with Toggle */}
              <div className="mb-6 border-b pb-6 text-left">
                <button
                  onClick={() => setShowVouchers(!showVouchers)}
                  className="flex items-center justify-between w-full text-lg font-semibold"
                >
                  <span>Apply Voucher</span>
                  {showVouchers ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                {showVouchers && (
                  <div className="mt-4 space-y-4">
                    {availableVouchers.filter(voucher => voucher.status !== "canceled" && voucher.status !== "expired").map((voucher) => (
  <div
    key={voucher._id}
    className={`border rounded-lg p-3 ${selectedVoucher?._id === voucher._id ? "border-blue-500" : "border-gray-200"}`}
  >
    <div className="flex items-center justify-between">
      <div>
        <h4 className="font-semibold">{voucher.code}</h4>
        <p className="text-green-600">${voucher.discount}</p>
        <p className="text-sm text-gray-500">Expires: {new Date(voucher.validTo).toLocaleDateString()}</p>
      </div>
      <input
        type="radio"
        name="voucher"
        checked={selectedVoucher?._id === voucher._id}
        onChange={() => handleVoucherSelection(voucher)}
        className="ml-4"
      />
    </div>
  </div>
))}

                    {selectedVoucher && (
                      <button
                        onClick={handleCancelVoucherSelection}
                        className="mt-4 mx-auto text-red-500 hover:underline block"
                      >
                        Cancel Voucher Selection
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Price Summary */}
              <div className="space-y-4 border-b pb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (10%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                </div>
                {isDiscountApplied && (
                  <div className="flex justify-between text-green-600">
                    <span>Promo Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                {pointsValue > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Points Discount</span>
                    <span>-${pointsValue.toFixed(2)}</span>
                  </div>
                )}
                {voucherDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Voucher Discount</span>
                    <span>-${voucherDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-blue-600">
                  <span>Points Earned</span>
                  <span>{earnedPoints} Points</span>
                </div>
              </div>
              {/* Total */}
              <div className="mt-6 mb-8 py-4 border-t border-b">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <Link 
                  to="/"
                  className="w-full inline-block text-center py-3 px-4 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Continue Shopping
                </Link>
                <Link 
                  to="/checkout"
                  className={`w-full inline-block text-center py-3 px-4 rounded-md font-medium transition-colors ${cartItems.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                  style={{ pointerEvents: cartItems.length === 0 ? 'none' : 'auto' }}
                >
                  Proceed to Checkout
                </Link>
              </div>                       
            </div>
          </div>
        </div>
      </main>
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default CartPage;
