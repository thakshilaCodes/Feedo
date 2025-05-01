const axios = require('axios');

const RESTAURANT_SERVICE_BASE_URL = process.env.RESTAURANT_SERVICE_URL || 'http://localhost:5000/api';

/**
 * Notify restaurant service about a new order
 * @param {Object} order - The saved order document from MongoDB
 * @returns {Promise<Object>} - restaurant service response
 */
exports.notifyRestaurantOfOrder = async (order) => {
  try {
    // Transform the order data to match the restaurant service's expected format
    const orderData = {
      customerId: order.customerId,
      restaurantId: order.restaurantId,
      items: order.items.map(item => ({
        itemId: item.itemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        specialInstructions: item.specialInstructions || ''
      })),
      deliveryAddress: {
        street: order.deliveryAddress.street,
        city: order.deliveryAddress.city,
        postalCode: order.deliveryAddress.postalCode,
        additionalInfo: order.deliveryAddress.additionalInfo || ''
      },
      contactPhone: order.contactPhone,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus || 'PENDING',
      status: order.status || 'CREATED',
      ...(order.paymentId && { paymentId: order.paymentId }),
      ...(order.deliveryId && { deliveryId: order.deliveryId }),
      ...(order.estimatedDeliveryTime && { estimatedDeliveryTime: order.estimatedDeliveryTime })
    };

    const response = await axios.post(
      `${RESTAURANT_SERVICE_BASE_URL}/menu-items/orders`,  // Updated endpoint path
      orderData,
      {
        headers: {
          'Content-Type': 'application/json',
          // Add any required auth headers here if needed
          // 'Authorization': `Bearer ${process.env.SERVICE_AUTH_TOKEN}`
        },
        timeout: 5000  // 5 second timeout
      }
    );

    return response.data;
  } catch (error) {
    console.error('Failed to notify restaurant service:', {
      message: error.message,
      response: error.response?.data,
      stack: error.stack
    });
    
    // Enhance the error with more context
    const serviceError = new Error(`Restaurant service notification failed: ${error.message}`);
    serviceError.isServiceError = true;
    serviceError.originalError = error;
    throw serviceError;
  }
};