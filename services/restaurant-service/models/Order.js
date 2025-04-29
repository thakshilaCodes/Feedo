// models/Order.js
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  specialInstructions: {
    type: String
  }
});

const orderSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  items: [orderItemSchema],
  deliveryAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    additionalInfo: { type: String }
  },
  contactPhone: {
    type: String,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['CREDIT_CARD', 'DEBIT_CARD', 'CASH_ON_DELIVERY', 'ONLINE_PAYMENT'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
    default: 'PENDING'
  },
  paymentId: {
    type: String
  },
  status: {
    type: String,
    enum: ['CREATED', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
    default: 'CREATED'
  },
  deliveryId: {
    type: mongoose.Schema.Types.ObjectId
  },
  estimatedDeliveryTime: {
    type: Date
  },
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for order tracking URL
orderSchema.virtual('trackingUrl').get(function() {
  return `/track/${this._id}`;
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;