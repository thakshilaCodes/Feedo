const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    contactNumber: { type: String, required: true },
    role: {
        type: String,
        enum: ["admin", "restaurantManager", "customer", "deliveryPerson"],
        default: "customer"
    },
    // Restaurant information for restaurant managers
    restaurantInfo: {
        name: { type: String },
        address: { type: String }
    },
    isApproved: {
        type: Boolean,
        default: function () {
            // Customers are approved automatically, others are not
            return this.role === "customer";
        }
    },
    // Delivery Person Specific Fields
    driverProfile: {
        isVerified: {
            type: Boolean,
            default: false
        },
        vehicleType: {
            type: String,
            enum: ["BICYCLE", "MOTORCYCLE", "CAR", "VAN"],
            default: null
        },
        vehicleDetails: {
            model: { type: String },
            licensePlate: { type: String }
        }
    }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);