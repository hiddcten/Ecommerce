import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiBell } from "react-icons/fi";
import { FaShoppingCart, FaTrash } from "react-icons/fa";
import axios from 'axios';

const Navigation = ({ isLoggedIn, userName, handleLogout, cartItems, setCartItems, userRole }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  
  const handleMouseEnter = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    const newTimeoutId = setTimeout(() => {
      setIsHovered(false);
    }, 300);
    setTimeoutId(newTimeoutId);
  };

  const handleBellClick = () => {
    if (userRole === 'admin') {
      setShowNotifications(!showNotifications);
    }
  };
  
  

  const markNotificationsAsRead = async () => {
    try {
      await axios.post('http://localhost:5000/api/orders/mark-as-read'); // Gửi yêu cầu cập nhật trạng thái đơn hàng
      setNotifications([]);
      localStorage.setItem('notifications', JSON.stringify([])); // Lưu trạng thái vào localStorage
    } catch (error) {
      console.error("There was an error marking the notifications as read!", error);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleRemoveFromCart = async (productId) => {
    if (userRole !== 'admin') {
      const token = localStorage.getItem("authToken");
      console.log("Removing product from cart:", productId);
      if (typeof productId === 'object' && productId._id) {
        productId = productId._id; // Sửa lỗi Object
      }
      if (token) {
        try {
          const response = await axios.delete(`http://localhost:5000/api/cart/${productId}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          console.log("Cart after removing product:", response.data.cartItems);
          setCartItems(response.data.cartItems); // Cập nhật giỏ hàng sau khi xoá sản phẩm
          window.location.reload(); // Tự động tải lại trang ngay lập tức
        } catch (error) {
          console.error("There was an error removing the item from the cart!", error);
        }
      } else {
        setCartItems((prevItems) => prevItems.filter(item => item.productId !== productId));
        window.location.reload(); // Tự động tải lại trang ngay lập tức
      }
    }
  };
  
  

  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [timeoutId]);

  // Sử dụng polling để kiểm tra đơn hàng mới
  useEffect(() => {
    const savedNotifications = JSON.parse(localStorage.getItem('notifications')) || [];
    setNotifications(savedNotifications);
  
    const fetchNewOrders = async () => {
      if (userRole === 'admin') {
        try {
          const response = await axios.get('http://localhost:5000/api/orders/pending');
          setNotifications(response.data);
        } catch (error) {
          console.error("There was an error fetching the pending orders!", error);
        }
      }
    };
  
    if (userRole === 'admin') {
      fetchNewOrders();
      const intervalId = setInterval(fetchNewOrders, 30000); // Kiểm tra đơn hàng mới mỗi 30 giây
      return () => clearInterval(intervalId);
    } else {
      setShowNotifications(false); // Reset trạng thái showNotifications nếu không phải admin
    }
  }, [userRole]);
  
  const consolidateCartItems = (items) => {
  const consolidatedItems = [];
  items.forEach(item => {
    const existingItem = consolidatedItems.find(i => i.productId === item.productId);
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      consolidatedItems.push({ ...item });
    }
  });
  return consolidatedItems;
};

  return (
    <nav className="fixed top-0 w-full bg-gray-900 text-white shadow-md z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-2xl font-bold text-blue-400">TechStore</Link>
            <div className="hidden md:flex space-x-6 relative">
              <Link to="/laptop" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Laptops</Link>
              <Link to="/phone" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Phones</Link>
              <Link to="/tablet" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Tablets</Link>
              <Link to="/console" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Consoles</Link>
              <Link to="/accessory" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Accessories</Link>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div
                className="p-2 cursor-pointer transform hover:scale-110 transition-transform duration-200"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={handleBellClick}
              >
                <div className="relative">
                  {userRole === 'admin' ? (
                    <FiBell className="text-2xl text-white hover:text-blue-400" />
                  ) : (
                    <FaShoppingCart className="text-2xl text-white hover:text-blue-400" />
                  )}
                  {totalItems > 0 && userRole !== 'admin' && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {totalItems}
                    </span>
                  )}
                  {notifications.length > 0 && userRole === 'admin' && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {notifications.length}
                    </span>
                  )}
                </div>

                {isHovered && totalItems > 0 && userRole !== 'admin' && (
                  <div className="absolute right-0 mt-6 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 transition-all duration-300 ease-in-out">
                    <div className="p-4 border-b border-gray-200">
                      <h2 className="text-lg font-bold text-gray-800">Items in Cart</h2>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
  {cartItems.map((item) => (
    <Link
      key={item.productId?._id || item.productId}
      to={item.productId?.slug ? `/product-detail/${item.productId.slug}` : '#'} // Kiểm tra slug
      onClick={(e) => {
        if (!item.productId?.slug) {
          e.preventDefault();
        }
      }}
    >
      <div className="flex items-center p-4 hover:bg-gray-50 border-b border-gray-100">
        {console.log("Cart item:", item)}
        <img
          src={item.image ? `http://localhost:5000${item.image}` : "https://images.unsplash.com/photo-1595246140520-1991cca1aaaa"} // Kiểm tra và sử dụng ảnh dự phòng
          alt={item.name}
          className="w-16 h-16 object-cover rounded-md"
        />
        <div className="ml-4 flex-grow">
          <h3 className="text-sm font-medium text-gray-800 text-left">{item.name}</h3>
          <div className="flex items-center mt-1">
            <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
            <span className="mx-2 text-gray-400">|</span>
            <span className="text-sm font-medium text-gray-800">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        </div>
        <button
          className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
          onClick={(e) => {
            e.preventDefault();
            handleRemoveFromCart(item.productId?._id || item.productId);
          }}
        >
          <FaTrash className="text-sm" />
        </button>
      </div>
    </Link>
  ))}
</div>






<div className="p-4 border-t border-gray-200">
  <div className="flex justify-between items-center mb-4">
    <span className="text-gray-600">Subtotal:</span>
    <span className="text-lg font-bold text-gray-800">
      ${calculateSubtotal().toFixed(2)}
    </span>
  </div>

  <div className="grid grid-cols-2 gap-4">
    <Link to="/cart" className="col-span-2">
      <button className="px-2 py-2 w-full text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200">
        View Cart
      </button>
    </Link>
  </div>
</div>

                  </div>
                )}
              </div>
            </div>
            {userRole === 'admin' && (
              <Link to="/admin" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Admin
              </Link>
            )}
            <div className="relative group">
              {isLoggedIn ? (
                <>
                  <div className="flex items-center space-x-2 cursor-pointer group-hover:text-blue-400 transition-colors">
                    <FiUser className="text-2xl" />
                    <span>Hello, {userName}</span>
                  </div>
                  <div className="absolute right-0 mt-2 w-48 bg-white text-gray-900 shadow-lg rounded-lg py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link to="/user-profile" className="block px-4 py-2 hover:bg-gray-100 text-center">Profile</Link>
                    <button onClick={handleLogout} className="w-full text-center px-4 py-2 hover:bg-gray-100">Logout</button>
                  </div>
                </>
              ) : (
                <Link to="/login" className="flex items-center space-x-2">
                  <FiUser className="text-2xl" />
                  <span>Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
      {userRole === 'admin' && showNotifications && (
        <div className="absolute right-0 mt-6 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 transition-all duration-300 ease-in-out">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800">Notifications</h2>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex items-center p-4 text-center">
                <p className="text-sm text-gray-600">Nothing here</p>
              </div>
            ) : (
              notifications.map((order) => (
                <div key={order._id} className="flex items-center p-4 hover:bg-gray-50 border-b border-gray-100">
                  <div className="ml-4 flex-grow">
                    <h3 className="text-sm font-medium text-gray-800">Order ID: {order._id}</h3>
                    <p className="text-sm text-gray-600">Total: ${order.total}</p>
                    <p className="text-sm text-gray-600">Date: {new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <button 
                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-200"
                onClick={markNotificationsAsRead}
              >
                Mark as Read
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navigation;
