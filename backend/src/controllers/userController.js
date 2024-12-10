const User = require('../models/User');
const Order = require('../models/Order');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Không thể lấy danh sách người dùng', error: error.message });
  }
};

exports.getUserPersonalInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
      fullName: user.name,
      email: user.email,
      phone: user.phoneNumber
    });
  } catch (error) {
    console.error('Error fetching personal info:', error);
    res.status(500).json({ message: 'Error fetching personal info', error: error.message });
  }
};

exports.getUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ role: user.role });
  } catch (error) {
    console.error('Error fetching user role:', error);
    res.status(500).json({ message: 'Error fetching user role', error: error.message });
  }
};


exports.getUserAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user.address);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ message: 'Error fetching addresses', error: error.message });
  }
};

exports.getUserRewards = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user.loyaltyPoints);
  } catch (error) {
    console.error('Error fetching rewards:', error);
    res.status(500).json({ message: 'Error fetching rewards', error: error.message });
  }
};

exports.getUserTransactions = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    console.log("User ID:", user ? user._id : 'User not found');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const orders = await Order.find({ userId: user._id }).populate('products.productId', 'name price');
    console.log("Fetched Orders for User ID:", user._id, orders);

    orders.forEach(order => {
      order.products.forEach(product => {
        if (product.productId) {
          console.log("Product found:", product.productId);
        } else {
          console.error("Product not found or null:", product);
        }
      });
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
};



