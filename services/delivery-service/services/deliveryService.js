const Delivery = require('../../models/Delivery');
const Driver = require('../../models/Driver');
const logger = require('../utils/logger');
const { notifyUser, notifyDriver } = require('./notificationService');

// Assign delivery to nearest available driver
exports.assignDeliveryToDriver = async (deliveryId) => {
  try {
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery || delivery.status !== 'CONFIRMED') {
      logger.error(`Cannot assign delivery ${deliveryId}: Invalid status or not found`);
      return false;
    }
    
    // Find nearby available drivers
    const availableDrivers = await Driver.find({
      isAvailable: true,
      isVerified: true,
      status: 'AVAILABLE'
    });
    
    if (availableDrivers.length === 0) {
      logger.warn(`No available drivers for delivery ${deliveryId}`);
      return false;
    }
    
    // Filter out drivers who already rejected this delivery
    const rejectedDriverIds = delivery.rejectedBy.map(item => item.driverId.toString());
    const eligibleDrivers = availableDrivers.filter(driver => 
      !rejectedDriverIds.includes(driver._id.toString())
    );
    
    if (eligibleDrivers.length === 0) {
      logger.warn(`No eligible drivers for delivery ${deliveryId} - all available drivers have rejected`);
      return false;
    }
    
    // Calculate distances and sort by proximity
    const driversWithDistance = eligibleDrivers.map(driver => {
      const distance = driver.calculateDistance(
        delivery.pickupLocation.latitude,
        delivery.pickupLocation.longitude
      );
      return { driver, distance };
    });
    
    // Sort by distance (closest first)
    driversWithDistance.sort((a, b) => a.distance - b.distance);
    
    // Get closest driver
    const closestDriver = driversWithDistance[0].driver;
    
    // Notify driver about new delivery
    await notifyDriver(closestDriver._id, 'New delivery request', {
      deliveryId: delivery._id,
      orderId: delivery.orderId,
      pickupLocation: delivery.pickupLocation,
      dropoffLocation: delivery.dropoffLocation,
      distance: delivery.distance
    });
    
    logger.info(`Notified driver ${closestDriver._id} about delivery ${deliveryId}`);
    return true;
  } catch (err) {
    logger.error(`Error assigning delivery to driver: ${err.message}`);
    return false;
  }
};

// Reassign delivery after rejection
exports.reassignDelivery = async (deliveryId) => {
  try {
    // Same logic as assignDeliveryToDriver, but with additional logging
    const result = await exports.assignDeliveryToDriver(deliveryId);
    
    if (!result) {
      // If no drivers available, mark for retry after delay
      const delivery = await Delivery.findById(deliveryId);
      if (delivery && delivery.status === 'CONFIRMED') {
        // After multiple failed attempts, notify restaurant
        if (delivery.deliveryAttempts >= 5) {
          logger.warn(`Unable to find driver for delivery ${deliveryId} after 5 attempts`);
          
          // Notify restaurant about driver shortage
          const { notifyRestaurant } = require('./notificationService');
          await notifyRestaurant(delivery.restaurantId, 'Driver shortage alert', {
            orderId: delivery.orderId,
            message: 'We are experiencing difficulty finding a driver. Please prepare for potential delay.'
          });
          
          // Notify customer about delay
          await notifyUser(delivery.customerId, 'Delivery delay notification', {
            orderId: delivery.orderId,
            message: 'We are currently experiencing high demand and working on assigning a driver to your order. Thank you for your patience.'
          });
        }
        
        // Schedule reassignment after delay
        setTimeout(() => {
          exports.reassignDelivery(deliveryId);
        }, 60000); // Retry after 1 minute
      }
    }
    
    return result;
  } catch (err) {
    logger.error(`Error reassigning delivery: ${err.message}`);
    return false;
  }
};

// Get nearby drivers for a location
exports.getNearbyDrivers = async (latitude, longitude, maxDistance = 5) => {
  try {
    const availableDrivers = await Driver.find({
      isAvailable: true,
      isVerified: true,
      status: 'AVAILABLE',
      'currentLocation.latitude': { $ne: null },
      'currentLocation.longitude': { $ne: null }
    });
    
    // Calculate distance for each driver
    const driversWithDistance = availableDrivers.map(driver => {
      const distance = driver.calculateDistance(latitude, longitude);
      return { driver, distance };
    });
    
    // Filter by max distance and sort
    return driversWithDistance
      .filter(item => item.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance)
      .map(item => ({
        id: item.driver._id,
        name: item.driver.name,
        distance: item.distance,
        location: item.driver.currentLocation
      }));
  } catch (err) {
    logger.error(`Error finding nearby drivers: ${err.message}`);
    return [];
  }
};

// Process pending deliveries (scheduler)
exports.processPendingDeliveries = async () => {
  try {
    const pendingDeliveries = await Delivery.find({
      status: 'CONFIRMED',
      driverId: null
    }).sort({ createdAt: 1 }); // Process oldest first
    
    logger.info(`Processing ${pendingDeliveries.length} pending deliveries`);
    
    for (const delivery of pendingDeliveries) {
      await exports.assignDeliveryToDriver(delivery._id);
    }
  } catch (err) {
    logger.error(`Error processing pending deliveries: ${err.message}`);
  }
};