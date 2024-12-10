// controllers/orderController.js
const Order = require('../models/Order');
const { formatOrderId } = require('../utils/utils');

exports.getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('products.productId');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    const formattedOrder = {
      ...order.toObject(),
      orderId: formatOrderId(order._id.toString())
    };
    res.status(200).json({ order: formattedOrder });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order details', error: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('products.productId');
    const formattedOrders = orders.map(order => ({
      ...order.toObject(),
      orderId: formatOrderId(order._id.toString())
    }));
    res.status(200).json({ orders: formattedOrders });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};
