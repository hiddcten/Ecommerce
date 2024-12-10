const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');
const Cart = require('../models/Cart');
const Product = require('../models/Product'); // Import thêm model Product
const { formatOrderId } = require('../utils/utils');
const { sendOrderConfirmationEmail } = require('../utils/emailService'); // Import dịch vụ gửi email
const authenticateJWT = require('../middleware/authenticateJWT'); // Import middleware xác thực

// Hàm giảm số lượng sản phẩm trong kho
async function updateProductStock(orderItems) {
  for (const item of orderItems) {
    const product = await Product.findById(item.productId);
    if (product) {
      product.stock -= item.quantity;
      product.variants.forEach(variant => {
        variant.stock -= item.quantity;
      });
      await product.save();
    }
  }
}

// Định nghĩa route để lưu đơn hàng
router.post('/', async (req, res) => {
  try {
    const { userId, pointsEarned, pointsUsed } = req.body;
    const newOrder = new Order(req.body);
    newOrder.total = Number(newOrder.total);
    await newOrder.save();

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.loyaltyPoints += pointsEarned - pointsUsed;
    await user.save();

    await Cart.findOneAndDelete({ userId });

    // Lấy chi tiết sản phẩm từ Product model
    const productDetails = await Product.find({
      _id: { $in: newOrder.products.map(p => p.productId) }
    });

    const productMap = productDetails.reduce((map, product) => {
      map[product._id] = product.name;
      return map;
    }, {});

    // Gọi hàm giảm số lượng sản phẩm
    await updateProductStock(newOrder.products);

    // Tạo nội dung email
    const orderDetails = `
      Order ID: ${formatOrderId(newOrder._id.toString())}
      Total: $${newOrder.total}
      Points Earned: ${newOrder.pointsEarned}
      Shipping Address: ${newOrder.address.fullAddress}
      Products:
      ${newOrder.products.map(product => ` - ${productMap[product.productId]} (Quantity: ${product.quantity})`).join('\n')}
    `;

    // Gửi email xác nhận
    sendOrderConfirmationEmail(user.email, orderDetails);

    res.status(201).send(newOrder);
  } catch (error) {
    console.error("Error saving order:", error);
    if (error && error.errInfo && error.errInfo.details) {
      const details = error.errInfo.details;
      console.error("Validation error details:", JSON.stringify(details, null, 2));
      res.status(400).send({ message: "Validation error", details: details });
    } else {
      res.status(500).send({ message: "Internal server error", error: error.message });
    }
  }
});

// API để kiểm tra các đơn hàng với trạng thái "pending"
router.get('/pending', async (req, res) => {
  try {
    const pendingOrders = await Order.find({ status: 'pending' });
    res.status(200).send(pendingOrders);
  } catch (error) {
    console.error("Error fetching pending orders:", error);
    res.status(500).send({ message: "Error fetching pending orders", error: error.message });
  }
});

// API để cập nhật trạng thái các đơn hàng từ "pending" sang "processing"
router.post('/mark-as-read', async (req, res) => {
  try {
    await Order.updateMany({ status: 'pending' }, { status: 'processing' });
    res.status(200).send({ message: 'Orders marked as processing' });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).send({ message: "Error updating order status", error: error.message });
  }
});

// API để lấy chi tiết đơn hàng theo ID
router.get('/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId).populate('products.productId');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const user = await User.findById(order.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const formattedOrder = {
      ...order.toObject(),
      customerName: user.name, // Thêm thông tin customerName từ User
      orderId: formatOrderId(order._id.toString())
    };

    res.status(200).json({ success: true, order: formattedOrder });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ success: false, message: "Error fetching order", error: error.message });
  }
});

// API để lấy tất cả các đơn hàng
router.get('/', async (req, res) => {
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
});

// API để cập nhật trạng thái đơn hàng
router.put('/:id/status', async (req, res) => {
  try {
    const orderId = req.params.id;
    const newStatus = req.body.status;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status: newStatus },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ success: false, message: "Error updating order status", error: error.message });
  }
});

// API để cập nhật thông tin đơn hàng
router.put('/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const { address, status } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        address,
        status
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ success: false, message: "Error updating order", error: error.message });
  }
});

router.get('/has-purchased/:productId', authenticateJWT, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.userId;

    const order = await Order.findOne({
      userId: userId,
      'products.productId': productId
    });

    res.status(200).json({ hasPurchased: !!order });
  } catch (error) {
    console.error('Error checking purchase:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


module.exports = router;
