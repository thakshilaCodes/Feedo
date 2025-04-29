const User = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register Controller
exports.register = async (req, res) => {
  try {
    const { fullName, email, password, contactNumber, role, restaurantName, restaurantAddress,vehicleType, vehicleModel, licensePlate } = req.body;

    // Disallow admin registration through this route
    if (role === "admin") {
      return res.status(403).json({ status: false, message: "Admin registration is not allowed through this route" });
    }

    // Check if restaurant manager is providing restaurant details
    if (role === "restaurantManager") {
      if (!restaurantName || !restaurantAddress) {
        return res.status(400).json({ 
          status: false, 
          message: "Restaurant name and address are required for restaurant managers" 
        });
      }
    }

    // Validation for delivery persons (drivers)
    if (role === "deliveryPerson") {
      if (!vehicleType || !vehicleModel || !licensePlate) {
        return res.status(400).json({
          status: false,
          message: "Vehicle type, model, and license plate are required for delivery personnel"
        });
      }
    }


    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ status: false, message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let isApproved = false;
    // Customers are automatically approved
    if (role === "customer") {
      isApproved = true;
    }

    const userData = {
      fullName,
      email,
      password: hashedPassword,
      contactNumber,
      role,
      isApproved
    };

    // Add restaurant information if role is restaurant manager
    if (role === "restaurantManager") {
      userData.restaurantInfo = {
        name: restaurantName,
        address: restaurantAddress
      };
    }

    if (role === "deliveryPerson") {
      userData.driverProfile = {
        vehicleType,
        vehicleDetails: {
          model: vehicleModel,
          licensePlate
        }
      };
    }

    const user = new User(userData);
    const savedUser = await user.save();

    const { password: _, ...userResponse } = savedUser.toObject();

    res.status(201).json({
      status: true,
      message: "User registered successfully! Awaiting approval if required.",
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// Login Controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if the account is approved
    if ((user.role === "restaurantManager" || user.role === "deliveryPerson") && !user.isApproved) {
      return res.status(403).json({ message: "Account not yet approved by Admin" });
    }

    // Admins and customers can log in directly without checking approval

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...userData } = user.toObject();
    res.json({ token, user: userData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};