// File: routes/index.js
const express = require('express');
const { validateRequest } = require('../middleware/validation');
const { authenticateToken, authorizeDriver, authorizeAdmin } = require('../middleware/auth');
const driverController = require('../controllers/driverController');
const deliveryController = require('../controllers/deliveryController');
const mapController = require('../controllers/mapController');

const router = express.Router();

// Public routes
router.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));//ok

// Delivery tracking (public with order ID)
router.get('/track/:orderId', deliveryController.trackDelivery);


// Driver registration (from user service)
router.post('/drivers/register', validateRequest, driverController.registerDriver);//ok

// Driver routes (driver authorization required)
router.get('/drivers/:id', /*authorizeDriver*/ driverController.getDriverProfile);//ok
router.put('/drivers/:id/availability', /*authorizeDriver*/ validateRequest, driverController.updateAvailability);//ok
router.put('/drivers/:id/location', /*authorizeDriver*/ validateRequest, driverController.updateLocation);//ok
router.get('/drivers/:id/deliveries', authorizeDriver, driverController.getDriverDeliveries);
router.post('/drivers/:id/accept', /*authorizeDriver*/ validateRequest, driverController.acceptDelivery);//ok
router.post('/drivers/:id/reject', authorizeDriver, validateRequest, driverController.rejectDelivery);
router.put('/drivers/:id/deliveries/:deliveryId/status', authorizeDriver, validateRequest, driverController.updateDeliveryStatus);

// Map related routes
router.get('/map/directions', mapController.getDirections);

// Delivery routes
router.post('/deliveries', validateRequest, deliveryController.createDelivery);//ok
router.put('/deliveries/confirm/:orderId', validateRequest, deliveryController.confirmDelivery);
router.get('/deliveries/:id', deliveryController.getDeliveryById);
router.get('/deliveries/order/:orderId', deliveryController.getDeliveryByOrderId);
router.post('/deliveries/:id/cancel', validateRequest, deliveryController.cancelDelivery);
router.post('/deliveries/:id/rate', validateRequest, deliveryController.rateDelivery);

// Admin routes
router.get('/admin/drivers', authorizeAdmin, driverController.getAllDrivers);
router.get('/admin/deliveries', authorizeAdmin, deliveryController.getAllDeliveries);

module.exports = router;
