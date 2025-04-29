const mongoose = require('mongoose');
const Order = require('../models/Order');

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const {
      restaurantId,
      items,
      deliveryAddress,
      contactPhone,
      paymentMethod
    } = req.body;

    // Use authenticated user's ID as customerId
    const customerId = req.user._id;

    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const order = new Order({
      customerId,
      restaurantId,
      items,
      deliveryAddress,
      contactPhone,
      totalAmount,
      paymentMethod,
      status: 'CREATED'
    });

    const savedOrder = await order.save();

    res.status(201).json({ success: true, data: savedOrder });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ success: false, message: 'Failed to create order', error: error.message });
  }
};

// Get orders by customer ID
exports.getCustomerOrders = async (req, res) => {
  try {
    const { customerId } = req.params;
    
    // Validate customerId format
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ success: false, message: 'Invalid customer ID format' });
    }
    
    // Security check - users can only access their own orders
    if (req.user.role !== 'admin' && req.user._id !== customerId) {
      return res.status(403).json({ success: false, message: 'Access denied: You can only view your own orders' });
    }
    
    const orders = await Order.find({ customerId }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: orders.length, data: orders });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders', error: error.message });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate order ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID format' });
    }
    
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Security check - customers can only access their own orders
    // Restaurant managers can only access orders for their restaurant
    if (
      req.user.role === 'customer' && order.customerId.toString() !== req.user._id.toString() ||
      req.user.role === 'restaurantManager' && order.restaurantId.toString() !== req.user.restaurantInfo._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.status(200).json({ success: true, data: order });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch order', error: error.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate order ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID format' });
    }
    
    const validStatuses = ['CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Security check - restaurant managers can only update orders for their restaurant
    if (order.restaurantId.toString() !== req.user.restaurantInfo._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied: Not your restaurant order' });
    }

    order.status = status;
    const updatedOrder = await order.save();

    res.status(200).json({ success: true, data: updatedOrder });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update order status', error: error.message });
  }
};

// Modify order
exports.modifyOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { items, deliveryAddress, contactPhone } = req.body;
    
    // Validate order ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID format' });
    }
    
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Security check - customers can only modify their own orders
    if (order.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied: Not your order' });
    }

    if (order.status !== 'CREATED') {
      return res.status(400).json({ success: false, message: 'Cannot modify confirmed orders' });
    }

    if (items) {
      order.items = items;
      order.totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    if (deliveryAddress) order.deliveryAddress = deliveryAddress;
    if (contactPhone) order.contactPhone = contactPhone;

    const updatedOrder = await order.save();
    res.status(200).json({ success: true, data: updatedOrder });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to modify order', error: error.message });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate order ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID format' });
    }
    
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Security check - customers can only cancel their own orders
    if (order.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied: Not your order' });
    }

    if (['DELIVERED', 'CANCELLED'].includes(order.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel order in ${order.status} status` });
    }

    order.status = 'CANCELLED';
    const updatedOrder = await order.save();

    res.status(200).json({ success: true, data: updatedOrder });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to cancel order', error: error.message });
  }
};