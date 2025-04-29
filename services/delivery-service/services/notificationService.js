const axios = require('axios');
const logger = require('../utils/logger');
const { io } = require('./socketService');

// Notify user (customer) through notification service
exports.notifyUser = async (userId, title, data) => {
  try {
    const response = await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/api/notifications`, {
      userId,
      type: 'DELIVERY_UPDATE',
      title,
      data
    });
    
    // Also emit via Socket.IO for real-time updates
    io.to(`user_${userId}`).emit('delivery_update', {
      title,
      data
    });
    
    logger.info(`Notification sent to user ${userId}: ${title}`);
    return response.data;
  } catch (err) {
    logger.error(`Failed to send notification to user ${userId}: ${err.message}`);
    return null;
  }
};

// Notify driver through notification service
exports.notifyDriver = async (driverId, title, data) => {
  try {
    const response = await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/api/notifications`, {
      userId: driverId,
      type: 'DELIVERY_REQUEST',
      title,
      data
    });
    
    // Also emit via Socket.IO for real-time updates
    io.to(`driver_${driverId}`).emit('delivery_request', {
      title,
      data
    });
    
    logger.info(`Notification sent to driver ${driverId}: ${title}`);
    return response.data;
  } catch (err) {
    logger.error(`Failed to send notification to driver ${driverId}: ${err.message}`);
    return null;
  }
};

// Notify restaurant through notification service
exports.notifyRestaurant = async (restaurantId, title, data) => {
  try {
    const response = await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/api/notifications`, {
      restaurantId,
      type: 'DELIVERY_UPDATE',
      title,
      data
    });
    
    // Also emit via Socket.IO for real-time updates
    io.to(`restaurant_${restaurantId}`).emit('delivery_update', {
      title,
      data
    });
    
    logger.info(`Notification sent to restaurant ${restaurantId}: ${title}`);
    return response.data;
  } catch (err) {
    logger.error(`Failed to send notification to restaurant ${restaurantId}: ${err.message}`);
    return null;
  }
};