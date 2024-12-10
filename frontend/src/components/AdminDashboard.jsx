import React, { useState, useEffect } from "react"; 
import axios from 'axios';
import { BsGrid, BsClipboardData, BsBox, BsPeople, BsTag, BsGear } from "react-icons/bs";
import { FiMenu, FiBell } from "react-icons/fi";
import { Line, Pie, Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement } from "chart.js";
import { Link } from 'react-router-dom'; 

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement);


const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [notifications] = useState(5);
  const [currentOrderPage, setCurrentOrderPage] = useState(1);
  const [currentProductPage, setCurrentProductPage] = useState(1);
  const [currentUserPage, setCurrentUserPage] = useState(1);
  const [users, setUsers] = useState([]); // Khai báo state cho users
  const [products, setProducts] = useState([]); // Khai báo state cho products
  const [orders, setOrders] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState({});
  const [promotions, setPromotions] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [sortOption, setSortOption] = useState("default");

  const [revenue, setRevenue] = useState(0);
  const [revenueByWeek, setRevenueByWeek] = useState([]);
  const [topProducts, setTopProducts] = useState([]);


  const itemsPerPage = 20;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await axios.get("http://localhost:5000/api/users");
        setUsers(userResponse.data.users);
  
        const productResponse = await axios.get("http://localhost:5000/api/products");
        setProducts(productResponse.data.products);
  
        const promotionResponse = await axios.get("http://localhost:5000/api/promotions");
        const promotionsData = promotionResponse.data;
        
        // Kiểm tra và cập nhật trạng thái expired
        const today = new Date();
        const updatedPromotions = await Promise.all(promotionsData.map(async (promotion) => {
          if (new Date(promotion.validTo) < today && promotion.status !== 'expired') {
            await axios.put(`http://localhost:5000/api/promotions/${promotion._id}/status`, { status: 'expired' });
            promotion.status = 'expired';
          }
          return promotion;
        }));
        setPromotions(updatedPromotions);
  
      } catch (error) {
        console.error("There was an error fetching the data!", error);
      }
    };
  
    fetchData();
  }, []);
  

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/orders");
        setOrders(response.data.orders);
  
        // Tính toán số lượng đơn hàng theo trạng thái
        const statusCounts = response.data.orders.reduce((counts, order) => {
          counts[order.status] = (counts[order.status] || 0) + 1;
          return counts;
        }, {});
        setOrderStatusData(statusCounts);
  
        // Tính tổng doanh thu theo tuần trong tháng hiện tại
        const currentMonth = new Date().getMonth();
        const revenueByWeek = [0, 0, 0, 0];
        
        response.data.orders.forEach(order => {
          const orderDate = new Date(order.createdAt);
          if (orderDate.getMonth() === currentMonth) {
            const weekOfMonth = Math.floor((orderDate.getDate() - 1) / 7);
            revenueByWeek[weekOfMonth] += order.total;
          }
        });
        
        setRevenueByWeek(revenueByWeek);
  
        // Tính tổng số lượng mua của từng sản phẩm
        const productCounts = response.data.orders.reduce((counts, order) => {
          order.products.forEach(product => {
            if (product.productId && product.productId._id) {
              counts[product.productId._id] = (counts[product.productId._id] || 0) + product.quantity;
            }
          });
          return counts;
        }, {});
  
        // Lấy top 4 sản phẩm được mua nhiều nhất
        const topProducts = Object.entries(productCounts)
          .sort(([,a],[,b]) => b - a)
          .slice(0, 4) // Chỉ chọn 4 sản phẩm thay vì 5
          .map(([id, count]) => {
            const product = response.data.orders.flatMap(order => order.products)
              .find(p => p.productId && p.productId._id === id);
            return { name: product ? product.productId.name : 'Unknown Product', count };
          });
  
        setTopProducts(topProducts);
  
      } catch (error) {
        console.error("There was an error fetching the orders!", error);
      }
    };
  
    fetchOrders();
  }, []);
  

  const cancelOrder = async (id) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/orders/${id}/status`, {
        status: 'canceled'
      });
  
      if (response.status === 200) {
        setOrders(orders.map(order =>
          order._id === id ? { ...order, status: 'canceled' } : order
        ));
        console.log("Order canceled:", response.data);
      } else {
        console.error("Error canceling order:", response.data);
      }
    } catch (error) {
      console.error("There was an error canceling the order!", error);
    }
  };
  
  const sortProducts = (products, sortOption) => {
    switch (sortOption) {
      case "recent":
        return [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case "default":
      default:
        return products;
    }
  };
  
  
  const handleCancelPromotion = async (id) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/promotions/${id}/status`, {
        status: 'canceled'
      });
  
      if (response.status === 200) {
        setPromotions(promotions.map(promotion =>
          promotion._id === id ? { ...promotion, status: 'canceled' } : promotion
        ));
        console.log("Promotion canceled:", response.data);
      } else {
        console.error("Error canceling promotion:", response.data);
      }
    } catch (error) {
      console.error("There was an error canceling the promotion!", error);
    }
  };
  
  const handleBanUnban = async (userId, currentStatus) => {
    console.log(`Attempting to update user status for ID: ${userId} to ${!currentStatus}`);
    
    try {
      console.log("ID being sent to API:", userId);
      const response = await axios.put(`http://localhost:5000/api/users/${userId}/userStatus`, { isActive: !currentStatus });
      console.log('API response:', response.data);
  
      setUsers(users.map(user => 
        user._id === userId ? { ...user, isActive: !currentStatus } : user
      ));
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };
  
  
  
  const filteredOrders = orders.filter((order) => {
    const orderDate = new Date(order.createdAt);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    if (start && end) {
      return orderDate >= start && orderDate <= end;
    }
    if (start) {
      return orderDate >= start;
    }
    if (end) {
      return orderDate <= end;
    }
    return true;
  });
  
  
  
  
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchKeyword.toLowerCase()) || 
    user.email.toLowerCase().includes(searchKeyword.toLowerCase())
  );
  
  
  
  
  
  const updatePromotionStatus = async (id, newStatus) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/promotions/${id}/status`, { status: newStatus });
      if (response.status === 200) {
        setPromotions(promotions.map(promotion =>
          promotion._id === id ? { ...promotion, status: newStatus } : promotion
        ));
        console.log('Promotion status updated:', response.data);
      } else {
        console.error('Error updating promotion status:', response.data);
      }
    } catch (error) {
      console.error('There was an error updating the promotion status!', error);
    }
  };
  
  

  const deleteProduct = (id) => {
    axios.delete(`http://localhost:5000/api/products/${id}`)
      .then(response => {
        console.log(response.data.message);
        setProducts(products.filter(product => product._id !== id));
      })
      .catch(error => {
        console.error("There was an error deleting the product!", error);
      });
  };
  
  
  const dummyMetrics = {
    users: users.length,
    orders: orders.length,
    revenue: 125000,
    products: products.length // Cập nhật số lượng sản phẩm từ dữ liệu thực
  };
  


  const dummyOrders = Array.from({ length: 100 }, (_, index) => ({
    id: index + 1,
    customer: `Customer ${index + 1}`,
    amount: Math.floor(Math.random() * 1000),
    status: Math.random() > 0.5 ? "Delivered" : "Processing",
    date: new Date(2024, 0, index + 1).toISOString().split("T")[0]
  }));

  const dummyProducts = Array.from({ length: 100 }, (_, index) => ({
    id: index + 1,
    name: `Product ${index + 1}`,
    price: Math.floor(Math.random() * 1000),
    stock: Math.floor(Math.random() * 100),
    status: Math.random() > 0.2 ? "Available" : "Low Stock"
  }));

  const chartData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Revenue",
        data: revenueByWeek, // Sử dụng dữ liệu doanh thu theo tuần
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1
      }
    ]
  };
  
  

  const pieData = {
    labels: Object.keys(orderStatusData),
    datasets: [
      {
        data: Object.values(orderStatusData),
        backgroundColor: ["#4CAF50", "#FFC107", "#F44336", "#2196F3", "#FF9800"]
      }
    ]
  };
  

  const barData = {
    labels: topProducts.map(product => product.name), // Sử dụng tên sản phẩm
    datasets: [
      {
        label: "Sales",
        data: topProducts.map(product => product.count), // Sử dụng số lượng sản phẩm
        backgroundColor: "rgba(54, 162, 235, 0.5)"
      }
    ]
  };
  
  

  const paginate = (items, currentPage) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  };

  const PaginationControls = ({ totalItems, currentPage, setCurrentPage }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return (
      <div className="flex justify-center items-center space-x-2 mt-4 mb-4">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    );
  };
  
const totalRevenue = revenueByWeek.reduce((sum, weekRevenue) => sum + weekRevenue, 0);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Total Users</h3>
                <p className="text-3xl font-bold">{users.length}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Total Orders</h3>
                <p className="text-3xl font-bold">{orders.length}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Revenue</h3>
                <p className="text-3xl font-bold">${totalRevenue.toFixed(2)}</p> {/* Hiển thị tổng doanh thu */}
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Products</h3>
                <p className="text-3xl font-bold">{products.length}</p>
              </div>
              <div className="col-span-2 bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
                <Line data={chartData} />
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Order Status</h3>
                <Pie data={pieData} />
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
  <h3 className="text-lg font-semibold mb-4">Product Performance</h3>
  <Bar data={barData} />
</div>


            </div>
        );
        case "orders":
      return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 flex justify-between items-center">
  <div className="flex items-center space-x-4">
    <input
      type="date"
      value={startDate}
      onChange={(e) => setStartDate(e.target.value)}
      className="p-2 border rounded-lg"
    />
    <input
      type="date"
      value={endDate}
      onChange={(e) => setEndDate(e.target.value)}
      className="p-2 border rounded-lg"
    />
  </div>
</div>

          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-4 text-left">Order ID</th>
                <th className="p-4 text-left">Products</th>
                <th className="p-4 text-left">Amount</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
  {paginate(filteredOrders, currentOrderPage).map((order) => (
    <tr key={order._id} className="border-t">
      <td className="p-4 text-left">{`OD-${order._id.slice(-6)}`}</td>
      <td className="p-4 text-left">
        {order.products.map((product) => (
          <div key={product._id}>
            {product.productId ? `${product.productId.name} (Quantity: ${product.quantity})` : 'Product not found'}
          </div>
        ))}
      </td>
      <td className="p-4 text-left">${order.total.toFixed(2)}</td>
      <td className="p-4 text-left">
        <span
          className={`px-2 py-1 rounded-full text-sm ${
            order.status === "completed"
              ? "bg-green-100 text-black-800"
              : order.status === "Delivered"
              ? "bg-green-100 text-green-800"
              : order.status === "canceled"
              ? "bg-red-100 text-red-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {order.status}
        </span>
      </td>
      <td className="p-4 text-left">{new Date(order.createdAt).toLocaleDateString()}</td>
      <td className="p-4 text-left">
        <Link 
          to={`/admin/edit-order/${order._id}`}
          className="text-blue-600 hover:text-blue-800 mr-2"
        >
          Edit
        </Link>
        <button 
          className="text-red-600 hover:text-red-800"
          onClick={() => cancelOrder(order._id)}
        >
          Cancel
        </button>
      </td>
    </tr>
  ))}
</tbody>

          </table>
          <PaginationControls
            totalItems={orders.length}
            currentPage={currentOrderPage}
            setCurrentPage={setCurrentOrderPage}
          />
        </div>
      );

        case "products":
          return (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 flex justify-between items-center">
  <Link 
    to="/admin/add-product"
    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
  >
    Add New Product
  </Link>
  <select
    value={sortOption}
    onChange={(e) => setSortOption(e.target.value)}
    className="p-2 border rounded-lg"
  >
    <option value="default">Default</option>
    <option value="recent">Recently Added</option>
  </select>
</div>

<table className="w-full">
  <thead>
    <tr className="bg-gray-50 text-left">
      <th className="p-4">STT</th>
      <th className="p-4">Name</th>
      <th className="p-4">Price</th>
      <th className="p-4">Total Stock</th>
      <th className="p-4">Variants</th>
      <th className="p-4">Status</th>
      <th className="p-4">Actions</th>
    </tr>
  </thead>
  <tbody>
    {paginate(sortProducts(products, sortOption), currentProductPage).map((product, index) => (
      <tr key={product._id} className="border-t text-left">
        <td className="p-4">{(currentProductPage - 1) * itemsPerPage + index + 1}</td>
        <td className="p-4">{product.name}</td>
        <td className="p-4">${product.price}</td>
        <td className="p-4">{product.stock}</td>
        <td className="p-4">{product.variants.length}</td>
        <td className="p-4">
          <span
            className={`px-2 py-1 rounded-full text-sm ${product.status === "Available" ? "bg-green-100 text-green-800" : product.status === "Low Stock" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}
          >
            {product.status}
          </span>
        </td>
        <td className="p-4">
          <Link 
            to={`/admin/edit-product/${product.slug}`}
            className="text-blue-600 hover:text-blue-800 mr-2"
          >
            Edit
          </Link>
          <button 
            className="text-red-600 hover:text-red-800"
            onClick={() => deleteProduct(product._id)}
          >
            Delete
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>

              <PaginationControls
                totalItems={products.length}
                currentPage={currentProductPage}
                setCurrentPage={setCurrentProductPage}
              />
            </div>
          );
          case "users":
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4">
        <input
          type="text"
          placeholder="Search users..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className="p-2 border rounded-lg"
        />
      </div>
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 text-left">
            <th className="p-4">STT</th>
            <th className="p-4">Name</th>
            <th className="p-4">Email</th>
            <th className="p-4">Role</th>
            <th className="p-4">Status</th>
            <th className="p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginate(filteredUsers, currentUserPage).map((user, index) => (
            <tr key={user._id} className="border-t text-left">
              <td className="p-4">{(currentUserPage - 1) * itemsPerPage + index + 1}</td>
              <td className="p-4">{user.name}</td>
              <td className="p-4">{user.email}</td>
              <td className="p-4">{user.role}</td>
              <td className="p-4">
                <span className={`px-2 py-1 rounded-full text-sm ${user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="p-4">
                <button
                  className="text-red-600 hover:text-red-800"
                  onClick={() => handleBanUnban(user._id, user.isActive)}
                >
                  {user.isActive ? "Ban" : "Unban"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <PaginationControls
        totalItems={filteredUsers.length}
        currentPage={currentUserPage}
        setCurrentPage={setCurrentUserPage}
      />
    </div>
  );


            case "promotions":
  const today = new Date();

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4">
        <Link
          to="/admin/add-promotion"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add New Promotion
        </Link>
      </div>
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 text-left">
            <th className="p-4">Code</th>
            <th className="p-4">Discount</th>
            <th className="p-4">Valid From</th>
            <th className="p-4">Valid To</th>
            <th className="p-4">Status</th>
            <th className="p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {promotions.map((promotion) => {
            const isExpired = new Date(promotion.validTo) < today;
            return (
              <tr key={promotion._id} className="border-t text-left">
                <td className="p-4">{promotion.code}</td>
                <td className="p-4">
                  ${promotion.discount}
                </td>
                <td className="p-4">{new Date(promotion.validFrom).toLocaleDateString()}</td>
                <td className="p-4">{new Date(promotion.validTo).toLocaleDateString()}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${isExpired ? "bg-red-100 text-red-800" : promotion.status === "active" ? "bg-green-100 text-green-800" : promotion.status === "canceled" ? "bg-gray-100 text-gray-800" : ""}`}
                  >
                    {isExpired ? "Expired" : promotion.status.charAt(0).toUpperCase() + promotion.status.slice(1)}
                  </span>
                </td>
                <td className="p-4">
                  <Link 
                    to={`/admin/edit-promotion/${promotion._id}`}
                    className="text-blue-600 hover:text-blue-800 mr-2"
                  >
                    Edit
                  </Link>
                  {promotion.status === 'canceled' ? (
                    <button
                      className="text-green-500 hover:text-green-700"
                      onClick={() => updatePromotionStatus(promotion._id, 'active')}
                    >
                      Active
                    </button>
                  ) : promotion.status === 'expired' ? (
                    <button className="text-gray-400 cursor-not-allowed" disabled>
                      Expired
                    </button>
                  ) : (
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => updatePromotionStatus(promotion._id, 'canceled')}
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );



          
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div
        className={`fixed top-0 left-0 h-full bg-gray-800 text-white transition-all duration-300 ${sidebarOpen ? "w-64" : "w-20"}`}
      >
        <div className="p-4 flex items-center justify-between">
          <h1 className={`font-bold text-xl ${!sidebarOpen && "hidden"}`}>Admin Panel</h1>
        </div>
        <nav className="mt-8">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center p-4 hover:bg-gray-700 ${activeTab === "dashboard" && "bg-gray-700"}`}
          >
            <BsGrid className="text-xl" />
            <span className={`ml-4 ${!sidebarOpen && "hidden"}`}>Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full flex items-center p-4 hover:bg-gray-700 ${activeTab === "orders" && "bg-gray-700"}`}
          >
            <BsClipboardData className="text-xl" />
            <span className={`ml-4 ${!sidebarOpen && "hidden"}`}>Orders</span>
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`w-full flex items-center p-4 hover:bg-gray-700 ${activeTab === "products" && "bg-gray-700"}`}
          >
            <BsBox className="text-xl" />
            <span className={`ml-4 ${!sidebarOpen && "hidden"}`}>Products</span>
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`w-full flex items-center p-4 hover:bg-gray-700 ${activeTab === "users" && "bg-gray-700"}`}
          >
            <BsPeople className="text-xl" />
            <span className={`ml-4 ${!sidebarOpen && "hidden"}`}>Users</span>
          </button>
     
          <button
            onClick={() => setActiveTab("promotions")}
            className="w-full flex items-center p-4 hover:bg-gray-700"
          >
            <BsTag className="text-xl" />  {/* Thay thế icon bằng icon phù hợp */}
            <span className={`ml-4 ${!sidebarOpen && "hidden"}`}>Promotions</span> {/* Hoặc "Coupons" */}
          </button>
        </nav>
      </div>

      <div className={`${sidebarOpen ? "ml-64" : "ml-20"} transition-all duration-300 flex flex-col flex-grow`}>
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <FiMenu className="text-xl" />
            </button>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <FiBell className="text-xl cursor-pointer" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notifications}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span>Admin User</span>
                <img
                  src="https://images.unsplash.com/photo-1633332755192-727a05c4013d"
                  alt="Admin"
                  className="w-8 h-8 rounded-full"
                />
              </div>
            </div>
          </div>
        </header>

        <main className="p-6 flex-grow">
          <h2 className="text-2xl font-semibold mb-6">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;