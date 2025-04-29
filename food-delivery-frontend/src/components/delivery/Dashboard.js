import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const DeliveryDashboard = () => {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        // In a real app, this would call your delivery service API
        // For demo purposes, we'll use mock data
        const mockDeliveries = [
          {
            id: '1',
            orderId: 'ORD-12345',
            restaurant: "Burger Palace",
            customer: "John Doe",
            address: "123 Main St, Apt 4B",
            status: 'pending',
            estimatedTime: '30 mins',
            amount: '$24.50'
          },
          {
            id: '2',
            orderId: 'ORD-12346',
            restaurant: "Pizza Heaven",
            customer: "Jane Smith",
            address: "456 Oak Ave",
            status: 'in_progress',
            estimatedTime: '15 mins',
            amount: '$18.75'
          },
          {
            id: '3',
            orderId: 'ORD-12347',
            restaurant: "Sushi World",
            customer: "Mike Johnson",
            address: "789 Pine Rd",
            status: 'completed',
            estimatedTime: 'Delivered',
            amount: '$32.90'
          }
        ];
        setDeliveries(mockDeliveries);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch deliveries');
        setLoading(false);
      }
    };
    fetchDeliveries();
  }, []);

  const filteredDeliveries = statusFilter === 'all' 
    ? deliveries 
    : deliveries.filter(d => d.status === statusFilter);

  const updateDeliveryStatus = async (deliveryId, newStatus) => {
    try {
      // In a real app, this would call your API to update status
      setDeliveries(deliveries.map(d => 
        d.id === deliveryId ? { ...d, status: newStatus } : d
      ));
    } catch (err) {
      setError('Failed to update delivery status');
    }
  };

  if (loading) return <div className="text-center py-8">Loading deliveries...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Delivery Dashboard</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Driver Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600 mb-1"><span className="font-medium">Name:</span> {user?.fullName}</p>
            <p className="text-gray-600 mb-1"><span className="font-medium">Email:</span> {user?.email}</p>
            <p className="text-gray-600 mb-1"><span className="font-medium">Contact:</span> {user?.contactNumber}</p>
          </div>
          {user?.driverProfile && (
            <div>
              <p className="text-gray-600 mb-1">
                <span className="font-medium">Vehicle:</span> {user.driverProfile.vehicleType} ({user.driverProfile.vehicleDetails.model})
              </p>
              <p className="text-gray-600 mb-1">
                <span className="font-medium">License Plate:</span> {user.driverProfile.vehicleDetails.licensePlate}
              </p>
              <p className="text-gray-600 mb-1">
                <span className="font-medium">Status:</span> 
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                  user.driverProfile.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {user.driverProfile.isVerified ? 'Verified' : 'Pending Verification'}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <h2 className="text-xl font-semibold p-6 pb-0">Delivery Assignments</h2>
        {filteredDeliveries.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No deliveries found
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restaurant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDeliveries.map((delivery) => (
                <tr key={delivery.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {delivery.orderId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {delivery.restaurant}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {delivery.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {delivery.address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {delivery.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      delivery.status === 'completed' ? 'bg-green-100 text-green-800' :
                      delivery.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {delivery.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {delivery.status === 'pending' && (
                      <button
                        onClick={() => updateDeliveryStatus(delivery.id, 'in_progress')}
                        className="text-blue-600 hover:text-blue-900 mr-2"
                      >
                        Accept
                      </button>
                    )}
                    {delivery.status === 'in_progress' && (
                      <button
                        onClick={() => updateDeliveryStatus(delivery.id, 'completed')}
                        className="text-green-600 hover:text-green-900"
                      >
                        Complete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Delivery Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-blue-800">Total Deliveries</h3>
            <p className="text-3xl font-bold text-blue-600">{deliveries.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-green-800">Completed</h3>
            <p className="text-3xl font-bold text-green-600">
              {deliveries.filter(d => d.status === 'completed').length}
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-yellow-800">In Progress</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {deliveries.filter(d => d.status === 'in_progress').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboard;