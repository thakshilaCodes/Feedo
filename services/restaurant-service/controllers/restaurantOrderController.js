const Order = require('../models/Order');

exports.saveOrder = async (req, res) => {
  try {
    // Validate required fields
    const requiredFields = [
      'customerId', 
      'restaurantId',
      'items',
      'deliveryAddress',
      'contactPhone',
      'totalAmount',
      'paymentMethod'
    ];
    
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    // Validate items array
    if (!Array.isArray(req.body.items) || req.body.items.length === 0) {
      return res.status(400).json({ error: 'At least one order item is required' });
    }

    // Create the order
    const order = new Order({
      customerId: req.body.customerId,
      restaurantId: req.body.restaurantId,
      items: req.body.items.map(item => ({
        itemId: item.itemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        specialInstructions: item.specialInstructions || ''
      })),
      deliveryAddress: {
        street: req.body.deliveryAddress.street,
        city: req.body.deliveryAddress.city,
        postalCode: req.body.deliveryAddress.postalCode,
        additionalInfo: req.body.deliveryAddress.additionalInfo || ''
      },
      contactPhone: req.body.contactPhone,
      totalAmount: req.body.totalAmount,
      paymentMethod: req.body.paymentMethod,
      paymentStatus: req.body.paymentStatus || 'PENDING',
      status: req.body.status || 'CREATED',
      ...(req.body.paymentId && { paymentId: req.body.paymentId }),
      ...(req.body.deliveryId && { deliveryId: req.body.deliveryId }),
      ...(req.body.estimatedDeliveryTime && { estimatedDeliveryTime: req.body.estimatedDeliveryTime })
    });

    // Save to database
    const savedOrder = await order.save();

    // Return success response with the created order
    res.status(201).json({
      success: true,
      message: 'Order saved successfully',
      order: savedOrder,
      trackingUrl: savedOrder.trackingUrl
    });

  } catch (err) {
    console.error('Error saving order:', err);
    res.status(500).json({ 
      success: false,
      error: err.message,
      message: 'Failed to save order'
    });
  }
};