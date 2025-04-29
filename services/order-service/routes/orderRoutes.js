// routes/orderRoutes.js

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { 
  authMiddleware, 
  customerMiddleware, 
  restaurantManagerMiddleware 
} = require('../middleware/authMiddleware');

// Create a new order - only customers can create orders
router.post(
  '/', 
  authMiddleware, 
  customerMiddleware, 
  orderController.createOrder
);

// Get orders by customer ID - customers can only view their own orders
router.get(
  '/me', 
  authMiddleware, 
  customerMiddleware, 
  (req, res, next) => {
    // Set customerId from authenticated user
    req.params.customerId = req.user._id;
    next();
  },
  orderController.getCustomerOrders
);

// Restaurant managers get their restaurant's orders
router.get(
  '/restaurant', 
  authMiddleware, 
  restaurantManagerMiddleware, 
  async (req, res) => {
    try {
      // Use restaurant info from the authenticated user
      const restaurantId = req.user.restaurantInfo?._id || req.user.restaurantInfo;
      
      if (!restaurantId) {
        return res.status(400).json({ 
          success: false, 
          message: 'No restaurant associated with this account' 
        });
      }
      
      const orders = await Order.find({ restaurantId }).sort({ createdAt: -1 });
      
      res.status(200).json({ 
        success: true, 
        count: orders.length, 
        data: orders 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch restaurant orders', 
        error: error.message 
      });
    }
  }
);

// Get order by ID - accessible to customers (their own orders) and restaurant managers
router.get(
  '/:id', 
  authMiddleware, 
  orderController.getOrderById
);

// Update order status - only restaurant managers can update status
router.patch(
  '/:id/status', 
  authMiddleware, 
  restaurantManagerMiddleware,
  orderController.updateOrderStatus
);

// Modify order - only customers can modify their pending orders
router.put(
  '/:id', 
  authMiddleware, 
  customerMiddleware,
  orderController.modifyOrder
);

// Cancel order - customers can cancel their own orders
router.patch(
  '/:id/cancel', 
  authMiddleware, 
  customerMiddleware,
  orderController.cancelOrder
);

module.exports = router;