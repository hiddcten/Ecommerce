const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const User = require('../models/User');
const Product = require('../models/Product');
const authenticateJWT = require('../middleware/authenticateJWT');

router.post('/create', authenticateJWT, async (req, res) => {
  try {
    const newCart = new Cart({
      userId: req.user.userId,
      products: [],
      loyaltyPoints: 0, // Điểm thưởng mặc định là 0
      shippingMethod: 'none'
    });
    await newCart.save();
    res.status(201).json({ message: 'Cart created', cart: newCart });
  } catch (error) {
    console.error('Error creating cart:', error);
    res.status(500).json({ message: 'Error creating cart', error: error.message });
  }
});

// Lấy giỏ hàng của người dùng
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.userId })
      .populate('products.productId', 'name price slug image') // Thêm slug
      .populate('voucher');

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    console.log('Cart Loyalty Points:', cart.loyaltyPoints); // Log giá trị loyaltyPoints từ cơ sở dữ liệu

    res.status(200).json({
      cartItems: cart.products,
      voucher: cart.voucher,
      shippingMethod: cart.shippingMethod,
      loyaltyPoints: cart.loyaltyPoints
    });
  } catch (error) {
    console.error('Error fetching cart details:', error);
    res.status(500).json({ message: 'Error fetching cart details', error: error.message });
  }
});



// Thêm sản phẩm vào giỏ hàng
router.post('/', authenticateJWT, async (req, res) => {
  const { product, voucher, shippingMethod } = req.body;
  console.log('Adding product to cart:', product, voucher, shippingMethod);

  try {
    const productDetails = await Product.findById(product.id);
    if (!productDetails) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let cart = await Cart.findOne({ userId: req.user.userId });

    if (!cart) {
      cart = new Cart({ userId: req.user.userId, products: [] });
    }

    const itemIndex = cart.products.findIndex(item => item.productId.toString() === product.id);
    if (itemIndex > -1) {
      cart.products[itemIndex].quantity += product.quantity;
    } else {
      cart.products.push({
        productId: product.id,
        slug: productDetails.slug,
        quantity: product.quantity,
        name: productDetails.name,
        price: productDetails.price,
        image: productDetails.images[0]
      });
    }

    if (voucher) {
      cart.voucher = voucher;
    }

    if (shippingMethod) {
      cart.shippingMethod = shippingMethod;
    }

    await cart.save();
    console.log('Cart after adding product:', cart);
    res.status(201).json({ message: 'Product added to cart', cartItems: cart.products });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Error adding to cart', error: error.message });
  }
});

// Xoá sản phẩm khỏi giỏ hàng
router.delete('/:productId', authenticateJWT, async (req, res) => {
  const { productId } = req.params;
  console.log('Deleting product from cart:', productId);
  try {
    const cart = await Cart.findOne({ userId: req.user.userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    const itemIndex = cart.products.findIndex(item => item.productId.toString() === productId);
    if (itemIndex > -1) {
      cart.products.splice(itemIndex, 1);
      await cart.save();
      res.status(200).json({ message: 'Product removed from cart', cartItems: cart.products });
    } else {
      res.status(404).json({ message: 'Product not found in cart' });
    }
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({ message: 'Error removing item from cart', error: error.message });
  }
});

// Xóa toàn bộ giỏ hàng của người dùng
router.delete('/', authenticateJWT, async (req, res) => {
  try {
    const result = await Cart.deleteOne({ userId: req.user.userId });
    if (result.deletedCount > 0) {
      res.status(200).json({ message: 'Cart reset successfully' });
    } else {
      res.status(404).json({ message: 'Cart not found' });
    }
  } catch (error) {
    console.error("Error resetting cart:", error);
    res.status(500).json({ message: 'Error resetting cart', error: error.message });
  }
});

// Cập nhật số lượng sản phẩm trong giỏ hàng
router.post('/update', authenticateJWT, async (req, res) => {
  const { productId, quantity } = req.body;
  console.log('Updating product quantity:', productId, quantity);

  try {
    let cart = await Cart.findOne({ userId: req.user.userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.products.findIndex(item => item.productId.toString() === productId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }

    cart.products[itemIndex].quantity = quantity;
    await cart.save();
    console.log('Cart after updating product quantity:', cart);
    res.status(200).json({ message: 'Product quantity updated', cartItems: cart.products });
  } catch (error) {
    console.error('Error updating product quantity:', error.message);
    res.status(500).json({ message: 'Error updating product quantity', error: error.message });
  }
});

// Cập nhật chi tiết giỏ hàng
router.post('/update-details', authenticateJWT, async (req, res) => {
  const { shippingMethod, voucher, loyaltyPoints } = req.body;
  try {
    const cart = await Cart.findOne({ userId: req.user.userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    if (shippingMethod !== undefined) {
      cart.shippingMethod = shippingMethod;
    }

    if (voucher === null) {
      cart.voucher = undefined;
    } else if (voucher !== undefined) {
      cart.voucher = voucher;
    }

    if (loyaltyPoints !== undefined) {
      cart.loyaltyPoints = loyaltyPoints;
    }

    await cart.save();
    res.status(200).json({ message: 'Cart details updated', cart });
  } catch (error) {
    console.error('Error updating cart details:', error);
    res.status(500).json({ message: 'Error updating cart details', error: error.message });
  }
});



module.exports = router;
