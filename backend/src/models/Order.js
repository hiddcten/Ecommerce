const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  products: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Product'
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      }
    }
  ],
  total: {
    type: Schema.Types.Mixed, // Sử dụng Mixed để hỗ trợ cả int và double
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'canceled'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  pointsEarned: {
    type: Number,
    required: true,
    min: 0
  },
  address: {
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    region: {
      type: String,
      required: true
    },
    fullAddress: {
      type: String,
      required: true
    }
  }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
