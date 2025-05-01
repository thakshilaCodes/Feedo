import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = localStorage.getItem('foodAppToken');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Token verification failed');
        }

        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('foodAppToken');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [API_URL]);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('foodAppToken', data.token);
      setUser(data.user);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('foodAppToken');
    setUser(null);
  };

  const register = async (
    fullName, 
    email, 
    password, 
    contactNumber, 
    role = 'customer', 
    restaurantInfo = null,
    driverInfo = null
  ) => {
    try {
      // Validation for restaurant managers
      if (role === 'restaurantManager') {
        if (!restaurantInfo || !restaurantInfo.name || !restaurantInfo.address) {
          throw new Error('Restaurant name and address are required for restaurant managers');
        }
      }
      
      // Validation for delivery persons
      if (role === 'deliveryPerson') {
        if (!driverInfo || 
            !driverInfo.vehicleType || 
            !driverInfo.vehicleModel || 
            !driverInfo.licensePlate ||
            !driverInfo.driverLicense ||
            !driverInfo.nicNumber) {
          throw new Error('All driver information is required for delivery persons');
        }
      }
      
      // Create request body
      const requestBody = { 
        fullName, 
        email, 
        password, 
        contactNumber, 
        role 
      };
      
      // Add restaurant information if role is restaurant manager
      if (role === 'restaurantManager' && restaurantInfo) {
        requestBody.restaurantName = restaurantInfo.name;
        requestBody.restaurantAddress = restaurantInfo.address;
      }
      
      // Add driver information if role is delivery person
      if (role === 'deliveryPerson' && driverInfo) {
        requestBody.vehicleType = driverInfo.vehicleType;
        requestBody.vehicleModel = driverInfo.vehicleModel;
        requestBody.licensePlate = driverInfo.licensePlate;
        requestBody.driverLicense = driverInfo.driverLicense;
        requestBody.nicNumber = driverInfo.nicNumber;
      }
  
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
  
      // For non-customer roles, user needs to wait for approval
      if (role !== 'customer') {
        return {
          success: true,
          requiresApproval: true,
          message: 'Registration successful! Your account is pending approval.'
        };
      }
  
      // For customers, we can log them in immediately
      if (data.token) {
        localStorage.setItem('foodAppToken', data.token);
        setUser(data.user);
      }
  
      return {
        success: true,
        requiresApproval: false,
        message: 'Registration successful!'
      };
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, message: error.message || 'Registration failed' };
    }
  };

  const hasRole = (roleToCheck) => {
    return user && user.role === roleToCheck;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      register,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      isRestaurantManager: user?.role === 'restaurantManager',
      isDeliveryPerson: user?.role === 'deliveryPerson',
      isCustomer: user?.role === 'customer',
      hasRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;