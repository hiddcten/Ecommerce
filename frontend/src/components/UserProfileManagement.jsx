import React, { useState, useEffect } from "react";
import axios from 'axios';
import { FiUser, FiLock, FiMap, FiClock, FiEye, FiEyeOff, FiShoppingCart, FiEdit2, FiTrash2, FiGift } from "react-icons/fi";
import { FaFacebook, FaGoogle } from "react-icons/fa";
import { toast } from 'react-toastify';
import Modal from 'react-modal'; 

const UserProfileManagement = () => {
  const [activeTab, setActiveTab] = useState("personal");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [currentPageTransactions, setCurrentPageTransactions] = useState(1);
  const [currentPageRewards, setCurrentPageRewards] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const itemsPerPage = 10;

  const handleNextPageTransactions = () => {
    setCurrentPageTransactions((prevPage) => prevPage + 1);
  };
  
  const handlePrevPageTransactions = () => {
    setCurrentPageTransactions((prevPage) => Math.max(prevPage - 1, 1));
  };
  
  const handleNextPageRewards = () => {
    setCurrentPageRewards((prevPage) => prevPage + 1);
  };
  
  const handlePrevPageRewards = () => {
    setCurrentPageRewards((prevPage) => Math.max(prevPage - 1, 1));
  };
  

  const [newAddress, setNewAddress] = useState({
    name: "",
    address: "",
    city: "",
    phone: ""
  });

  const [personalInfo, setPersonalInfo] = useState({
    fullName: "",
    email: "",
    phone: ""
  });

  const [addresses, setAddresses] = useState([]);
  const [editAddress, setEditAddress] = useState({
    name: "",
    address: "",
    city: "",
    phone: ""
  });

  const [rewards, setRewards] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const headers = { Authorization: `Bearer ${token}` };
  
        const [personalInfoResponse, addressesResponse, rewardsResponse, transactionsResponse] = await Promise.all([
          axios.get("http://localhost:5000/api/users/personal-info", { headers }),
          axios.get("http://localhost:5000/api/users/addresses", { headers }),
          axios.get("http://localhost:5000/api/users/rewards", { headers }),
          axios.get("http://localhost:5000/api/users/transactions", { headers }),
        ]);
  
        console.log("Fetched Transactions:", transactionsResponse.data); // Log dữ liệu transactions để kiểm tra
        console.log("Fetched Personal Info:", personalInfoResponse.data);
        console.log("Fetched Addresses:", addressesResponse.data.addresses);
        console.log("Fetched Rewards:", rewardsResponse.data);
  
        setPersonalInfo({
          fullName: personalInfoResponse.data.fullName,
          email: personalInfoResponse.data.email,
          phone: personalInfoResponse.data.phone
        });
        setAddresses(addressesResponse.data.addresses);
        setRewards(Array.isArray(rewardsResponse.data) ? rewardsResponse.data : []);
        setTransactions(transactionsResponse.data); // Cập nhật state `transactions` với dữ liệu Order
  
      } catch (error) {
        console.error("There was an error fetching the data!", error);
      }
    };
  
    fetchData();
  }, []); // Bỏ dependencies để chỉ gọi một lần khi component được mount
  
  const openModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };
  

  const handleCurrentPasswordChange = (e) => {
    setCurrentPassword(e.target.value);
  };
  
  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
    if (e.target.value !== confirmPassword) {
      setPasswordError('New password and confirm password do not match');
    } else {
      setPasswordError('');
    }
  };
  
  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    if (newPassword !== e.target.value) {
      setPasswordError('New password and confirm password do not match');
    } else {
      setPasswordError('');
    }
  };
  
  const handleUpdatePassword = async () => {
    if (passwordError) {
      showSuccessPopup(passwordError, false);
      return;
    }
  
    try {
      const token = localStorage.getItem("authToken");
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
      const data = { currentPassword, newPassword };
  
      console.log('Sending request to update password:', data);
      const response = await axios.put("http://localhost:5000/api/users/change-password", data, { headers });
  
      if (response.status === 200) {
        console.log('Password updated successfully');
        showSuccessPopup("Password updated successfully", true);
        // Xóa token và chuyển hướng đến trang đăng nhập
        localStorage.removeItem("authToken");
        window.location.href = "/login";
      }
    } catch (error) {
      console.error('There was an error updating the password!', error);
      if (error.response) {
        console.log('Error response data:', error.response.data);
      }
      showSuccessPopup("An error occurred while updating the password", false);
    }
  };
  
  
  

  // Sau đó, bạn có thể sử dụng biến `toast` trong các hàm của bạn
  const deleteAddress = async (addressId) => {
    try {
      const token = localStorage.getItem("authToken");
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.delete(`http://localhost:5000/api/users/addresses/${addressId}`, { headers });
  
      if (response.status === 200) {
        setAddresses(addresses.filter(address => address._id !== addressId));
        toast.success("Address deleted successfully");
      }
    } catch (error) {
      console.error("There was an error deleting the address!", error);
      toast.error("Failed to delete address");
    }
  };
  
  
  


  const saveAddress = async (addressId, updatedAddress) => {
    try {
      const token = localStorage.getItem("authToken");
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
      const response = await axios.put(`http://localhost:5000/api/users/addresses/${addressId}`, updatedAddress, { headers });
  
      if (response.status === 200) {
        setAddresses(addresses.map(address => address._id === addressId ? updatedAddress : address));
        toast.success("Address updated successfully");
      }
    } catch (error) {
      console.error("There was an error updating the address!", error);
      toast.error("Failed to update address");
    }
  };

  const handleSaveChanges = async () => {
    if (personalInfo.phone && personalInfo.phone.length < 10) {
      showSuccessPopup("Phone number must be at least 10 digits", false);
      return;
    }
  
    try {
      const token = localStorage.getItem("authToken");
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
      const response = await axios.put("http://localhost:5000/api/users/personal-info", personalInfo, { headers });
  
      if (response.status === 200) {
        showSuccessPopup("Information updated successfully", true);
      } else {
        showSuccessPopup("Failed to update information", false);
      }
    } catch (error) {
      console.error("There was an error updating the personal info!", error);
      showSuccessPopup("An error occurred while updating the information", false);
    }
  };
  
  
  
  
  const showSuccessPopup = (message, isSuccess) => {
    const popup = document.createElement('div');
    popup.className = `fixed bottom-4 right-4 p-4 rounded-md shadow-md text-white transition-opacity duration-300 ${isSuccess ? 'bg-green-600' : 'bg-red-600'}`;
    popup.innerText = message;
  
    document.body.appendChild(popup);
  
    setTimeout(() => {
      popup.classList.add('opacity-0');
      setTimeout(() => {
        document.body.removeChild(popup);
      }, 300);
    }, 3000);
  };
  
  

  const handlePhoneChange = (e) => {
    const phone = e.target.value;
    if (/^\d*$/.test(phone) && phone.length <= 15) {
      setPersonalInfo({ ...personalInfo, phone: phone || '' });
    }
  };
  
  
  

  const handleAddAddress = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
      const response = await axios.post("http://localhost:5000/api/users/addresses", newAddress, { headers });
  
      if (response.status === 200) {
        showSuccessPopup("Address added successfully", true);
        setAddresses([...addresses, response.data.address]);  // Đảm bảo rằng địa chỉ mới được thêm vào state
        setNewAddress({
          name: "",
          phone: "",
          region: "",
          fullAddress: ""
        });
        setShowAddAddressForm(false);
      } else {
        showSuccessPopup("Failed to add address", false);
      }
    } catch (error) {
      console.error("There was an error adding the address!", error);
      showSuccessPopup("An error occurred while adding the address", false);
    }
  };
  
  
  
  
  

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleEditClick = (address) => {
    setEditingAddressId(address._id);
    setEditAddress({
      name: address.name,
      phone: address.phone,
      region: address.region,
      fullAddress: address.fullAddress,
    });
  };
  

  const handleEditSave = async () => {
    if (editingAddressId && editAddress) {
      await saveAddress(editingAddressId, editAddress);
      setEditingAddressId(null);
      setEditAddress(null);
    }
  };
  
  

  const handleEditCancel = () => {
    setEditingAddressId(null);
    setEditAddress({
      name: "",
      address: "",
      city: "",
      phone: ""
    });
  };

  const renderSectionTitle = (title) => (
    <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-4">{title}</h2>
  );

  const renderRewards = () => {
    // Sắp xếp transactions theo ngày từ mới nhất đến cũ nhất
    const sortedTransactions = transactions.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
    // Tính toán phân trang
    const startIndex = (currentPageRewards - 1) * itemsPerPage;
    const paginatedRewards = sortedTransactions.slice(startIndex, startIndex + itemsPerPage);
  
    return (
      <div className="space-y-6 text-left">
        {renderSectionTitle("Rewards & Points")}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider text-center">Order Date</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider text-center">Products</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider text-center">Quantity</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider text-center">Total</th> {/* Đổi Details thành Total */}
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider text-center">Points Earned</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedRewards.map((transaction) => (
                <tr key={transaction._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">{new Date(transaction.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 text-center">
                    {transaction.products.map((product) => (
                      <div key={product._id}>
                        {product.productId ? `${product.productId.name} (${product.quantity})` : 'Product not found'}
                      </div>
                    ))}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 text-center">
                    {transaction.products.reduce((total, product) => total + product.quantity, 0)} {/* Hiển thị tổng số lượng sản phẩm */}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 text-center">
                    ${transaction.total.toFixed(2)} {/* Hiển thị giá trị Total */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600 text-center">{transaction.pointsEarned}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end">
          <div className="bg-indigo-50 p-3 lg:p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <p className="text-lg font-semibold text-indigo-800">
              Total Points: {transactions.reduce((sum, transaction) => sum + transaction.pointsEarned, 0)}
            </p>
          </div>
        </div>
  
        {/* Nút điều hướng phân trang */}
        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={handlePrevPageRewards}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
          >
            Previous
          </button>
          <button
            onClick={handleNextPageRewards}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    );
  };
  
  
  

  const renderPersonalInfo = () => (
    <div className="space-y-6 text-left">
      {renderSectionTitle("Personal Information")}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            value={personalInfo.fullName || ""}
            onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={personalInfo.email || ""}
            disabled
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            type="tel"
            value={personalInfo.phone || ""}
            onChange={handlePhoneChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors text-center"
          onClick={handleSaveChanges}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
  
    

  const renderChangePassword = () => (
    <div className="space-y-6 text-left">
      {renderSectionTitle("Change Password")}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Current Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={currentPassword}
              onChange={handleCurrentPasswordChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">New Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={handleNewPasswordChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
            <button
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
            </button>
          </div>
        </div>
        {passwordError && (
          <div className="text-red-600 text-sm">
            {passwordError}
          </div>
        )}
        <button
          className="w-full bg-indigo-600 text-white px-4 py-3 rounded-md hover:bg-indigo-700 transition-colors text-center"
          onClick={handleUpdatePassword}
        >
          Update Password
        </button>
      </div>
    </div>
  );
  
    

    const renderAddresses = () => (
      <div className="space-y-6 text-left">
        {renderSectionTitle("Shipping Addresses")}
        <button 
          onClick={() => setShowAddAddressForm(true)}
          className="w-full md:w-auto bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Add New Address
        </button>
    
        {showAddAddressForm && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={newAddress.name || ""}
                  onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="text"
                  value={newAddress.phone || ""}
                  onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Region</label>
                <input
                  type="text"
                  value={newAddress.region || ""}
                  onChange={(e) => setNewAddress({ ...newAddress, region: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Address</label>
                <input
                  type="text"
                  value={newAddress.fullAddress || ""}
                  onChange={(e) => setNewAddress({ ...newAddress, fullAddress: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleAddAddress}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowAddAddressForm(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
    
        <div className="grid gap-8 md:grid-cols-1">
          {Array.isArray(addresses) && addresses.filter(address => address && address._id).map((address) => (
            <div key={address._id} className="border rounded-lg p-4 relative">
              {editingAddressId === address._id ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={editAddress?.name || address.name}  // Hiển thị giá trị ban đầu nếu không có giá trị chỉnh sửa
                      onChange={(e) => setEditAddress({ ...editAddress, name: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="text"
                      value={editAddress?.phone || address.phone}  // Hiển thị giá trị ban đầu nếu không có giá trị chỉnh sửa
                      onChange={(e) => setEditAddress({ ...editAddress, phone: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Region</label>
                    <input
                      type="text"
                      value={editAddress?.region || address.region}  // Hiển thị giá trị ban đầu nếu không có giá trị chỉnh sửa
                      onChange={(e) => setEditAddress({ ...editAddress, region: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Address</label>
                    <input
                      type="text"
                      value={editAddress?.fullAddress || address.fullAddress}  // Hiển thị giá trị ban đầu nếu không có giá trị chỉnh sửa
                      onChange={(e) => setEditAddress({ ...editAddress, fullAddress: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleEditSave}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleEditCancel}
                      className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="font-medium">{address.name}</h3>
                  <p className="text-gray-600">{address.phone}</p>
                  <p className="text-gray-600">{address.region}</p>
                  <p className="text-gray-600">{address.fullAddress}</p>
                  <div className="absolute top-4 right-4 space-x-2">
                    <button
                      onClick={() => {
                        setEditingAddressId(address._id);
                        setEditAddress(address);  // Thiết lập giá trị ban đầu khi bắt đầu chỉnh sửa
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => deleteAddress(address._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
    
    const renderTransactions = () => {
      console.log("Render Transactions:", transactions);
    
      // Sắp xếp transactions theo ngày từ mới nhất đến cũ nhất
      const sortedTransactions = transactions.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
      // Tính toán phân trang
      const startIndex = (currentPageTransactions - 1) * itemsPerPage;
      const paginatedTransactions = sortedTransactions.slice(startIndex, startIndex + itemsPerPage);
    
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Products</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedTransactions.map((transaction) => (
                <tr key={transaction._id} onClick={() => openModal(transaction)} className="cursor-pointer hover:bg-gray-100">
                  <td className="px-6 py-4 whitespace-nowrap">{`OD-${transaction._id.slice(-6)}`}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(transaction.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {transaction.products.map((product) => (
                      <div key={product._id}>
                        {product.productId ? `${product.productId.name} (${product.quantity})` : 'Product not found'}
                      </div>
                    ))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">${transaction.total.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${transaction.status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
    
          {/* Nút điều hướng phân trang */}
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={handlePrevPageTransactions}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={handleNextPageTransactions}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      );
    };
    
    
    
    
    
    
    return (
      <div className="min-h-screen bg-gray-100">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">MY PROFILE</h1>
            <p className="mt-2 text-gray-600">Manage your personal information, password, shipping address</p>
          </div>
    
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-3 bg-white rounded-xl shadow-sm p-4">
              <nav className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-hidden">
                <button
                  onClick={() => handleTabChange("personal")}
                  className={`flex items-center px-4 py-3 rounded-lg transition-all ${activeTab === "personal" ? "bg-indigo-50 text-indigo-600" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  <FiUser className="h-5 w-5 mr-3" />
                  <span className="text-sm font-medium whitespace-nowrap">Personal Info</span>
                </button>
                <button
                  onClick={() => handleTabChange("password")}
                  className={`flex items-center px-4 py-3 rounded-lg transition-all ${activeTab === "password" ? "bg-indigo-50 text-indigo-600" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  <FiLock className="h-5 w-5 mr-3" />
                  <span className="text-sm font-medium whitespace-nowrap">Change Password</span>
                </button>
                <button
                  onClick={() => handleTabChange("addresses")}
                  className={`flex items-center px-4 py-3 rounded-lg transition-all ${activeTab === "addresses" ? "bg-indigo-50 text-indigo-600" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  <FiMap className="h-5 w-5 mr-3" />
                  <span className="text-sm font-medium whitespace-nowrap">Shipping Addresses</span>
                </button>
                <button
                  onClick={() => handleTabChange("transactions")}
                  className={`flex items-center px-4 py-3 rounded-lg transition-all ${activeTab === "transactions" ? "bg-indigo-50 text-indigo-600" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  <FiClock className="h-5 w-5 mr-3" />
                  <span className="text-sm font-medium whitespace-nowrap">Transaction History</span>
                </button>
                <button
                  onClick={() => handleTabChange("rewards")}
                  className={`flex items-center px-4 py-3 rounded-lg transition-all ${activeTab === "rewards" ? "bg-indigo-50 text-indigo-600" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  <FiGift className="h-5 w-5 mr-3" />
                  <span className="text-sm font-medium whitespace-nowrap">Rewards</span>
                </button>
              </nav>
            </div>
    
            <div className="lg:col-span-9 bg-white rounded-xl shadow-sm p-6">
              {activeTab === "personal" && renderPersonalInfo()}
              {activeTab === "password" && renderChangePassword()}
              {activeTab === "addresses" && renderAddresses()}
              {activeTab === "transactions" && (
                <div>
                  {renderSectionTitle("Transaction History")}
                  {renderTransactions()}
                </div>
              )}
              {activeTab === "rewards" && renderRewards()}
            </div>
          </div>
        </main>
    
          {/* Modal for Order Details */}
    {isModalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
        <div className="fixed inset-0 bg-black opacity-50"></div>
        <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-4xl sm:w-full">
          <div className="bg-white p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl font-bold text-center w-full">Order Details</h2> {/* Căn giữa và tăng kích thước phông chữ */}
              <button className="text-gray-400 hover:text-gray-500" onClick={closeModal}>
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            {selectedOrder && (
              <div className="text-left space-y-4"> {/* Thêm class `space-y-4` để dãn cách dòng */}
                <p className="text-lg"><strong>Customer Name:</strong> {personalInfo.fullName}</p>
                <p className="text-lg"><strong>Order ID:</strong> OD-{selectedOrder._id.slice(-6)}</p>
                <p className="text-lg"><strong>Order Date:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                <p className="text-lg"><strong>Shipping Address:</strong> {selectedOrder.address.fullAddress}</p>
                <p className="text-lg"><strong>Products:</strong></p>
                <ul className="list-disc pl-5 text-lg">
                  {selectedOrder.products.map((product) => (
                    <li key={product._id}>
                      {product.productId ? `${product.productId.name} (Quantity: ${product.quantity})` : 'Product not found'}
                    </li>
                  ))}
                </ul>
                <p className="text-lg"><strong>Total:</strong> ${selectedOrder.total.toFixed(2)}</p>
                <p className="text-lg"><strong>Points Earned:</strong> {selectedOrder.pointsEarned}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
);
    
};

export default UserProfileManagement;
