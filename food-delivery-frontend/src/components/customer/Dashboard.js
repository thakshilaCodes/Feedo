import React from 'react';
import { useAuth } from '../../context/AuthContext';

const CustomerDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Customer Dashboard</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Welcome, {user?.fullName}</h2>
        <p className="text-gray-600 mb-2">Email: {user?.email}</p>
        <p className="text-gray-600 mb-2">Contact: {user?.contactNumber}</p>
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Your Orders</h3>
          <p className="text-gray-500">No orders yet.</p>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;