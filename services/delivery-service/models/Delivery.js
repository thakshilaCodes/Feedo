// File: models/Delivery.js
const mongoose = require('mongoose');

const DeliverySchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  restaurantId: {
    type: String,
    required: true
  },
  customerId: {
    type: String,
    required: true
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    default: null
  },
  orderDetails: {
    items: [{
      name: String,
      quantity: Number,
      price: Number
    }],
    totalAmount: Number
  },
  pickupLocation: {
    address: {
      type: String,
      required: true
    },
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    }
  },
  dropoffLocation: {
    address: {
      type: String,
      required: true
    },
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    }
  },
  status: {
    type: String,
    enum: [

      'CONFIRMED', // Restaurant confirmed, looking for driver
      'DRIVER_ASSIGNED', // Driver has been assigned
      'PICKED_UP', // Driver has picked up the food
      'ON_THE_WAY', // Driver is on the way to customer
      'DELIVERED', // Successfully delivered
      'CANCELLED', // Order was cancelled
      'FAILED' // Delivery failed for some reason
    ],
    default: 'CONFIRMED'
  },
  statusHistory: [{
    status: {
      type: String,
      enum: [
        'PENDING',
        'CONFIRMED',
        'DRIVER_ASSIGNED',
        'PICKED_UP',
        'ON_THE_WAY',
        'DELIVERED',
        'CANCELLED',
        'FAILED'
      ]
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String,
      default: ''
    }
  }],
  estimatedDeliveryTime: {
    type: Date,
    default: null
  },
  actualDeliveryTime: {
    type: Date,
    default: null
  },
  rejectedBy: [{
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver'
    },
    reason: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  deliveryAttempts: {
    type: Number,
    default: 0
  },
  distance: {
    type: Number, // in km
    default: 0
  },
  deliveryNotes: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    default: null
  },
  feedback: {
    type: String,
    default: ''
  }
}, { timestamps: true });

// Method to update status with history tracking
DeliverySchema.methods.updateStatus = function(newStatus, note = '') {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    timestamp: Date.now(),
    note: note
  });
  
  // Update timestamps for specific statuses
  if (newStatus === 'DELIVERED') {
    this.actualDeliveryTime = Date.now();
  }
  
  return this;
};

// Calculate estimated delivery time
DeliverySchema.methods.calculateEstimatedDeliveryTime = function() {
  // Base time: 10 minutes for restaurant to prepare
  let estimatedMinutes = 10;
  
  // Add travel time based on distance (roughly 2 min per km)
  estimatedMinutes += this.distance * 2;
  
  // Add 5 minutes buffer
  estimatedMinutes += 5;
  
  const estimatedTime = new Date();
  estimatedTime.setMinutes(estimatedTime.getMinutes() + estimatedMinutes);
  
  this.estimatedDeliveryTime = estimatedTime;
  return this;
};

// Index for faster queries
DeliverySchema.index({ status: 1 });
DeliverySchema.index({ orderId: 1 });
DeliverySchema.index({ driverId: 1 });

module.exports = mongoose.model('Delivery', DeliverySchema);