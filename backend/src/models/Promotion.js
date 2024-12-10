const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    trim: true
  },
  discount: {
    type: Number,
    required: [true, 'Discount amount is required'],
    min: [0, 'Discount must be a positive integer'] // Giá trị giảm trực tiếp bằng số nguyên
  },
  validFrom: {
    type: Date,
    required: [true, 'Valid from date is required']
  },
  validTo: {
    type: Date,
    required: [true, 'Valid to date is required']
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'canceled'],
    required: [true, 'Status is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Promotion = mongoose.model('Promotion', promotionSchema);

module.exports = Promotion;
