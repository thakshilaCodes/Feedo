import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome to User Management System</h1>
      
      {user ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Hello, {user.fullName}</h2>
          <p className="text-gray-600 mb-2">Role: <span className="font-medium capitalize">{user.role}</span></p>
          <p className="text-gray-600 mb-2">Email: {user.email}</p>
          {user.role === 'restaurantManager' && user.restaurantInfo && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <h3 className="font-medium">Restaurant Information</h3>
              <p>Name: {user.restaurantInfo.name}</p>
              <p>Address: {user.restaurantInfo.address}</p>
            </div>
          )}
          {user.role === 'deliveryPerson' && user.driverProfile && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <h3 className="font-medium">Driver Information</h3>
              <p>Vehicle Type: {user.driverProfile.vehicleType}</p>
              <p>Model: {user.driverProfile.vehicleDetails.model}</p>
              <p>License Plate: {user.driverProfile.vehicleDetails.licensePlate}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Please login or register to continue</h2>
          <div className="flex space-x-4">
            <a
              href="/login"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Login
            </a>
            <a
              href="/register"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
            >
              Register
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;