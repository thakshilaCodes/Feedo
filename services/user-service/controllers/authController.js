const User = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register Controller
exports.register = async (req, res) => {
  try {
    const { 
      fullName, 
      email, 
      password, 
      contactNumber, 
      role, 
      restaurantName, 
      restaurantAddress,
      vehicleType, 
      vehicleModel, 
      licensePlate,
      driverLicense,
      nicNumber
    } = req.body;

    // Disallow admin registration through this route
    if (role === "admin") {
      return res.status(403).json({ 
        status: false, 
        message: "Admin registration is not allowed through this route" 
      });
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
      if (!vehicleType || !vehicleModel || !licensePlate || !driverLicense || !nicNumber) {
        return res.status(400).json({
          status: false,
          message: "All driver information is required for delivery personnel"
        });
      }
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        status: false, 
        message: "Email already in use" 
      });
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
      // Generate a unique restaurant ID
      const restaurantId = generateRestaurantId(restaurantName);
      
      userData.restaurantInfo = {
        id: restaurantId,  // Add the generated ID
        name: restaurantName,
        address: restaurantAddress
      };
    }

    // Add driver information if role is delivery person
    if (role === "deliveryPerson") {
      userData.driverProfile = {
        vehicleType,
        vehicleDetails: {
          model: vehicleModel,
          licensePlate
        },
        driverLicense,
        nicNumber
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
    res.status(500).json({ 
      status: false, 
      message: error.message 
    });
  }
};

// Helper function to generate restaurant ID
function generateRestaurantId(restaurantName) {
  // Clean the restaurant name (remove special characters and spaces)
  const cleanName = restaurantName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 10);  // Take first 10 characters
    
  // Generate a random 4-digit number
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  
  // Combine to create the ID (e.g., "mcdonalds1234")
  return `${cleanName}${randomNum}`;
}

// Login Controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        message: "Invalid credentials" 
      });
    }

    // Check if the account is approved
    if ((user.role === "restaurantManager" || user.role === "deliveryPerson") && !user.isApproved) {
      return res.status(403).json({ 
        message: "Account not yet approved by Admin" 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        message: "Invalid credentials" 
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...userData } = user.toObject();
    res.json({ 
      token, 
      user: userData 
    });
  } catch (error) {
    res.status(500).json({ 
      message: error.message 
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    
    if (!userId) {
      return res.status(400).json({ 
        status: false, 
        message: 'User ID not provided in request' 
      });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ 
        status: false, 
        message: 'User not found' 
      });
    }
    
    res.json({ 
      status: true, 
      user 
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ 
      status: false, 
      message: error.message 
    });
  }
};