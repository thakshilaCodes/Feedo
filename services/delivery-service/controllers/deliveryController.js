const Delivery = require('../models/Delivery');
const Driver = require('../models/Driver');
const logger = require('../utils/logger');
const { validateDeliveryData } = require('../utils/validation');
const deliveryService = require('../services/deliveryService');
const { notifyUser, notifyRestaurant } = require('../services/notificationService');

// Create a new delivery request from order management
exports.createDelivery = async (req, res) => {
    try {
        const { error } = validateDeliveryData(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        // Check if delivery for this order already exists
        const existingDelivery = await Delivery.findOne({ orderId: req.body.orderId });
        if (existingDelivery) {
            return res.status(409).json({
                error: 'Delivery for this order already exists',
                deliveryId: existingDelivery._id
            });
        }

        // Calculate distance using pickup and dropoff coordinates
        const distance = calculateDistance(
            req.body.pickupLocation.latitude,
            req.body.pickupLocation.longitude,
            req.body.dropoffLocation.latitude,
            req.body.dropoffLocation.longitude
        );

        // Create new delivery
        const delivery = new Delivery({
            orderId: req.body.orderId,
            restaurantId: req.body.restaurantId,
            customerId: req.body.customerId,
            orderDetails: req.body.orderDetails,
            pickupLocation: req.body.pickupLocation,
            dropoffLocation: req.body.dropoffLocation,
            status: 'PENDING',
            distance: distance,
            deliveryNotes: req.body.deliveryNotes || ''
        });

        // Add initial status to history
        delivery.statusHistory.push({
            status: 'CONFIRMED',
            timestamp: Date.now(),
            note: 'Delivery request created and is confirmed by the restaurant'
        });

        await delivery.save();
        logger.info(`New delivery created for order ${delivery.orderId}`);

        return res.status(201).json({
            message: 'Delivery request created successfully',
            delivery: {
                id: delivery._id,
                orderId: delivery.orderId,
                status: delivery.status,
                distance: delivery.distance
            }
        });
    } catch (err) {
        logger.error(`Error creating delivery: ${err.message}`);
        return res.status(500).json({ error: 'Failed to create delivery request' });
    }
};

// Function to calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

// Confirm delivery from restaurant
exports.confirmDelivery = async (req, res) => {
    try {
        const { orderId } = req.params;

        const delivery = await Delivery.findOne({ orderId });
        if (!delivery) {
            return res.status(404).json({ error: 'Delivery not found' });
        }

        if (delivery.status !== 'PENDING') {
            return res.status(400).json({
                error: `Delivery already in ${delivery.status} state`
            });
        }

        // Update status to CONFIRMED
        delivery.updateStatus('CONFIRMED', 'Order confirmed by restaurant');
        await delivery.save();

        logger.info(`Delivery ${delivery._id} confirmed by restaurant`);

        // Automatically try to assign a driver
        deliveryService.assignDeliveryToDriver(delivery._id);

        return res.status(200).json({
            message: 'Delivery confirmed successfully',
            delivery: {
                id: delivery._id,
                orderId: delivery.orderId,
                status: delivery.status
            }
        });
    } catch (err) {
        logger.error(`Error confirming delivery: ${err.message}`);
        return res.status(500).json({ error: 'Failed to confirm delivery' });
    }
};

// Get delivery by ID
exports.getDeliveryById = async (req, res) => {
    try {
        const delivery = await Delivery.findById(req.params.id)
            .populate('driverId', 'name phone currentLocation rating vehicleDetails');

        if (!delivery) {
            return res.status(404).json({ error: 'Delivery not found' });
        }

        return res.status(200).json({ delivery });
    } catch (err) {
        logger.error(`Error fetching delivery: ${err.message}`);
        return res.status(500).json({ error: 'Failed to fetch delivery details' });
    }
};

// Get delivery by order ID
exports.getDeliveryByOrderId = async (req, res) => {
    try {
        const delivery = await Delivery.findOne({ orderId: req.params.orderId })
            .populate('driverId', 'name phone currentLocation rating vehicleDetails');

        if (!delivery) {
            return res.status(404).json({ error: 'Delivery not found' });
        }

        return res.status(200).json({ delivery });
    } catch (err) {
        logger.error(`Error fetching delivery by order ID: ${err.message}`);
        return res.status(500).json({ error: 'Failed to fetch delivery details' });
    }
};

// Track delivery status and driver location
exports.trackDelivery = async (req, res) => {
    try {
        const { orderId } = req.params;

        const delivery = await Delivery.findOne({ orderId })
            .populate('driverId', 'name phone currentLocation rating vehicleDetails');

        if (!delivery) {
            return res.status(404).json({ error: 'Delivery not found' });
        }

        // Return tracking info based on delivery status
        const trackingInfo = {
            deliveryId: delivery._id,
            orderId: delivery.orderId,
            status: delivery.status,
            statusHistory: delivery.statusHistory,
            estimatedDeliveryTime: delivery.estimatedDeliveryTime,
            distance: delivery.distance
        };

        // Add driver info if assigned
        if (delivery.driverId) {
            trackingInfo.driver = {
                name: delivery.driverId.name,
                phone: delivery.driverId.phone,
                rating: delivery.driverId.rating,
                vehicleDetails: delivery.driverId.vehicleDetails,
                currentLocation: delivery.driverId.currentLocation
            };
        }

        return res.status(200).json({ tracking: trackingInfo });
    } catch (err) {
        logger.error(`Error tracking delivery: ${err.message}`);
        return res.status(500).json({ error: 'Failed to fetch tracking information' });
    }
};

// Get all deliveries (admin only)
exports.getAllDeliveries = async (req, res) => {
    try {
        // This should be protected with admin authorization
        const { status, limit = 20, page = 1 } = req.query;
        const skip = (page - 1) * parseInt(limit);

        const query = {};
        if (status) {
            query.status = status;
        }

        const deliveries = await Delivery.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('driverId', 'name phone');

        const total = await Delivery.countDocuments(query);

        return res.status(200).json({
            deliveries,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (err) {
        logger.error(`Error fetching all deliveries: ${err.message}`);
        return res.status(500).json({ error: 'Failed to fetch deliveries' });
    }
};

// Cancel delivery
exports.cancelDelivery = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const delivery = await Delivery.findById(id);
        if (!delivery) {
            return res.status(404).json({ error: 'Delivery not found' });
        }

        if (['DELIVERED', 'CANCELLED', 'FAILED'].includes(delivery.status)) {
            return res.status(400).json({
                error: `Cannot cancel delivery in ${delivery.status} state`
            });
        }

        // Update status to CANCELLED
        delivery.updateStatus('CANCELLED', reason || 'Delivery cancelled');
        await delivery.save();

        // If driver was assigned, update driver status
        if (delivery.driverId) {
            const driver = await Driver.findById(delivery.driverId);
            if (driver) {
                driver.isAvailable = true;
                driver.status = 'AVAILABLE';
                driver.currentDelivery = null;
                await driver.save();
            }
        }

        // Notify restaurant and customer
        await notifyRestaurant(delivery.restaurantId, 'Delivery cancelled', {
            orderId: delivery.orderId,
            reason: reason || 'No reason provided'
        });

        await notifyUser(delivery.customerId, 'Your delivery has been cancelled', {
            orderId: delivery.orderId,
            reason: reason || 'No reason provided'
        });

        logger.info(`Delivery ${id} cancelled: ${reason || 'No reason provided'}`);

        return res.status(200).json({
            message: 'Delivery cancelled successfully',
            deliveryId: delivery._id
        });
    } catch (err) {
        logger.error(`Error cancelling delivery: ${err.message}`);
        return res.status(500).json({ error: 'Failed to cancel delivery' });
    }
};

// Rate delivery
exports.rateDelivery = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, feedback } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        const delivery = await Delivery.findById(id);
        if (!delivery) {
            return res.status(404).json({ error: 'Delivery not found' });
        }

        if (delivery.status !== 'DELIVERED') {
            return res.status(400).json({ error: 'Can only rate completed deliveries' });
        }

        // Update delivery rating
        delivery.rating = rating;
        delivery.feedback = feedback || '';
        await delivery.save();

        // Update driver rating
        if (delivery.driverId) {
            const driver = await Driver.findById(delivery.driverId);
            if (driver) {
                // Calculate new average rating
                const totalRatings = driver.totalDeliveries;
                const currentTotalPoints = driver.rating * totalRatings;
                driver.rating = (currentTotalPoints + rating) / (totalRatings + 1);
                await driver.save();
            }
        }

        logger.info(`Delivery ${id} rated: ${rating}/5`);

        return res.status(200).json({
            message: 'Delivery rated successfully',
            deliveryId: delivery._id,
            rating: delivery.rating
        });
    } catch (err) {
        logger.error(`Error rating delivery: ${err.message}`);
        return res.status(500).json({ error: 'Failed to rate delivery' });
    }
};