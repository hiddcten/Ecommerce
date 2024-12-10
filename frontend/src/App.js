import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import HomePage from './components/HomePage';
import Register from './components/Register';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import ForgotPassword from './components/ForgotPassword';
import UserProfileManagement from './components/UserProfileManagement';
import NotFound from './components/NotFound';
import AddProductForm from './components/AddProductForm';
import ProductEditPage from './components/ProductEditPage';
import CheckoutPage from './components/CheckoutPage';
import BannedNotification from "./components/BannedNotification"
import ProductDetail from './components/ProductDetail';
import CartPage from './components/CartPage';
import './styles/tailwind.css';
import ProductCategoryPage from './components/ProductCategoryPage';
import LaptopCatalog from './components/LaptopCatalog';
import PhoneCatalog from './components/PhoneCatalog';
import ResetPassword from './components/ResetPassword';
import TabletCatalog from './components/TabletCatalog';
import ConsoleCatalog from './components/ConsoleCatalog';
import AccessoryCatalog from './components/AccessoryCatalog';
import OrderConfirmation from './components/OrderConfirmation';
import EditOrder from './components/EditOrder';
import AddCoupon from './components/AddCoupon';
import SearchResults from './components/SearchResults';
import EditCoupon from './components/EditCoupon';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import axios from 'axios';

const PrivateRoute = ({ element, role }) => {
  const token = localStorage.getItem("authToken");
  const userRole = localStorage.getItem("userRole");
  return token && userRole === role ? element : <Navigate to="*" />;
};


const LoginRedirectRoute = ({ element }) => {
  const token = localStorage.getItem("authToken");
  return token ? <Navigate to="/" /> : element;
};



function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("customer"); // Default role is 'customer'
  const [cartItems, setCartItems] = useState([]);
  const [readNotifications, setReadNotifications] = useState([]); // Thêm trạng thái để lưu trữ thông báo đã đọc
  const [orderConfirmed, setOrderConfirmed] = useState(false); // Thêm trạng thái để theo dõi việc hoàn thành đơn hàng

  const fetchCartItems = async (token) => {
    try {
      const response = await axios.get('http://localhost:5000/api/cart', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log("Fetched cart items:", response.data.cartItems);
      setCartItems(response.data.cartItems);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log("Cart not found, possibly empty.");
        setCartItems([]); // Giỏ hàng trống
      } else {
        console.error("There was an error fetching the cart items!", error);
      }
    }
  };
  

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const name = localStorage.getItem("userName");
    const role = localStorage.getItem("userRole");
    const readNotif = JSON.parse(localStorage.getItem("readNotifications") || "[]");

    if (token && name && role) {
      setIsLoggedIn(true);
      setUserName(name);
      setUserRole(role);
      if (role !== 'admin') {
        fetchCartItems(token); // Chỉ gọi hàm này nếu role không phải là admin
      }
    }
    setReadNotifications(readNotif); // Cập nhật trạng thái từ local storage

    const fetchUserRole = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/auth/role', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUserRole(response.data.role); // Đảm bảo response.data.role là 'admin' hoặc 'customer'
      } catch (error) {
        console.error("There was an error fetching the user role!", error);
      }
    };

    if (token) {
      fetchUserRole();
    }
  }, []);

  const handleLoginSuccess = (name, role) => {
    setIsLoggedIn(true);
    setUserName(name);
    setUserRole(role);
    localStorage.setItem("userRole", role);
    fetchCartItems(localStorage.getItem("authToken"));
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    localStorage.removeItem("readNotifications"); // Xóa thông báo đã đọc khi logout
    setIsLoggedIn(false);
    setUserName("");
    setUserRole("customer");
    setCartItems([]); // Reset cart items on logout
    setReadNotifications([]); // Reset trạng thái thông báo đã đọc
  };

  const handleAddToCart = async (product) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const response = await axios.post('http://localhost:5000/api/cart', { product }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        fetchCartItems(token); // Cập nhật giỏ hàng sau khi thêm sản phẩm
      } catch (error) {
        console.error("There was an error adding the item to the cart!", error.response.data);
      }
    } else {
      setCartItems((prevItems) => {
        const itemIndex = prevItems.findIndex(item => item.productId === product.id);
        if (itemIndex > -1) {
          const updatedItems = [...prevItems];
          updatedItems[itemIndex].quantity += product.quantity; // Cập nhật số lượng sản phẩm
          return updatedItems;
        } else {
          return [...prevItems, product]; // Truyền product với quantity
        }
      });
    }
  };

  const handleMarkNotificationsAsRead = () => {
    setReadNotifications(notifications => [...new Set([...notifications, ...readNotifications])]);
    localStorage.setItem("readNotifications", JSON.stringify(readNotifications));
  };

  return (
    <Router>
      <div className="App">
        <Navigation
          isLoggedIn={isLoggedIn}
          userName={userName}
          handleLogout={handleLogout}
          cartItems={cartItems}
          setCartItems={setCartItems}
          userRole={userRole}
          readNotifications={readNotifications}
          handleMarkNotificationsAsRead={handleMarkNotificationsAsRead}
          orderConfirmed={orderConfirmed} // Truyền trạng thái xuống Navigation
        />
        <Routes>
          <Route path="/" element={<HomePage onAddToCart={handleAddToCart} />} />
          <Route path="/register" element={<Register onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/login" element={<LoginRedirectRoute element={<Login onLoginSuccess={handleLoginSuccess} />} />} />
          <Route path="/admin" element={<PrivateRoute element={<AdminDashboard />} role="admin" />} />
          <Route path="/admin/add-product" element={<PrivateRoute element={<AddProductForm />} role="admin" />} />
          <Route path="/admin/edit-product/:id" element={<PrivateRoute element={<ProductEditPage />} role="admin" />} />
          <Route path="/admin/add-promotion" element={<PrivateRoute element={<AddCoupon />} role="admin" />} />
          <Route path="/admin/edit-promotion/:id" element={<PrivateRoute element={<EditCoupon />} role="admin" />} />
          <Route path="/admin/edit-order/:id" element={<PrivateRoute element={<EditOrder />} role="admin" />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/user-profile" element={<UserProfileManagement />} />
          <Route path="/cart" element={<CartPage cartItems={cartItems} setCartItems={setCartItems} />} />
          <Route path="/product-detail/:slug" element={<ProductDetail onAddToCart={handleAddToCart} />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/category" element={<ProductCategoryPage />} />
          <Route path="/laptop" element={<LaptopCatalog />} />
          <Route path="/phone" element={<PhoneCatalog />} />
          <Route path="/tablet" element={<TabletCatalog />} />
          <Route path="/console" element={<ConsoleCatalog />} />
          <Route path="/accessory" element={<AccessoryCatalog />} />
          <Route path="/laptop/:slug" element={<ProductDetail onAddToCart={handleAddToCart} />} />
          <Route path="/phone/:slug" element={<ProductDetail onAddToCart={handleAddToCart} />} />
          <Route path="/tablet/:slug" element={<ProductDetail onAddToCart={handleAddToCart} />} />
          <Route path="/console/:slug" element={<ProductDetail onAddToCart={handleAddToCart} />} />
          <Route path="/accessory/:slug" element={<ProductDetail onAddToCart={handleAddToCart} />} />
          <Route path="/order-confirmation" element={<OrderConfirmation setOrderConfirmed={setOrderConfirmed} />} /> {/* Truyền hàm setOrderConfirmed */}
          <Route path="/search/:keyword" element={<SearchResults />} />
          <Route path="/banned" element={<BannedNotification />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="*" element={<NotFound />} />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
