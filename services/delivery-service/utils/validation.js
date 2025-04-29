// File: utils/validation.js
const Joi = require('joi');

// Validate delivery data
exports.validateDeliveryData = (data) => {
  const schema = Joi.object({
    orderId: Joi.string().required(),
    restaurantId: Joi.string().required(),
    customerId: Joi.string().required(),
    orderDetails: Joi.object({
      items: Joi.array().items(
        Joi.object({
          name: Joi.string().required(),
          quantity: Joi.number().integer().min(1).required(),
          price: Joi.number().min(0).required()
        })
      ).required(),
      totalAmount: Joi.number().min(0).required()
    }).required(),
    pickupLocation: Joi.object({
      address: Joi.string().required(),
      latitude: Joi.number().required(),
      longitude: Joi.number().required()
    }).required(),
    dropoffLocation: Joi.object({
      address: Joi.string().required(),
      latitude: Joi.number().required(),
      longitude: Joi.number().required()
    }).required(),
    deliveryNotes: Joi.string()
  });
  
  return schema.validate(data);
};

// Validate driver data
exports.validateDriverData = (data) => {
  const schema = Joi.object({
    userId: Joi.string().required(),
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    isVerified: Joi.boolean(),
    vehicleType: Joi.string().valid('BICYCLE', 'MOTORCYCLE', 'CAR', 'VAN').required(),
    vehicleDetails: Joi.object({
      model: Joi.string().required(),
      licensePlate: Joi.string().required()
    }).required()
  });
  
  return schema.validate(data);
};